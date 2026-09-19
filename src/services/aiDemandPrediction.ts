import { AIPredictionResult, Medicine, SalesHistoryRecord } from '../types';
import { storage } from './storage';

/**
 * AI Medicine Demand Prediction Service
 * Implements Ordinary Least Squares (OLS) Linear Regression and Moving Average
 * feature engineering based on historical sales data to forecast future pharmacy inventory demand.
 * 
 * Safety Notice: This model is strictly for pharmaceutical supply-chain inventory forecasting
 * and does not provide clinical diagnosis or prescription recommendations.
 */
export class AIDemandPredictionService {
  /**
   * Run Linear Regression model to calculate slope (m) and intercept (c):
   * y = m * x + c
   */
  private static calculateLinearRegression(points: { x: number; y: number }[]): {
    slope: number;
    intercept: number;
    r2: number;
  } {
    const n = points.length;
    if (n < 2) {
      return { slope: 0, intercept: points[0]?.y || 0, r2: 0 };
    }

    let sumX = 0;
    let sumY = 0;
    let sumXY = 0;
    let sumX2 = 0;
    let sumY2 = 0;

    for (const p of points) {
      sumX += p.x;
      sumY += p.y;
      sumXY += p.x * p.y;
      sumX2 += p.x * p.x;
      sumY2 += p.y * p.y;
    }

    const denominator = n * sumX2 - sumX * sumX;
    if (denominator === 0) {
      return { slope: 0, intercept: sumY / n, r2: 0 };
    }

    const slope = (n * sumXY - sumX * sumY) / denominator;
    const intercept = (sumY - slope * sumX) / n;

    // Calculate Coefficient of Determination (R²)
    const meanY = sumY / n;
    let ssTot = 0;
    let ssRes = 0;
    for (const p of points) {
      const predY = slope * p.x + intercept;
      ssTot += Math.pow(p.y - meanY, 2);
      ssRes += Math.pow(p.y - predY, 2);
    }
    const r2 = ssTot === 0 ? 1 : Math.max(0, 1 - ssRes / ssTot);

    return { slope, intercept, r2 };
  }

  /**
   * Predict future demand for a chosen medicine across 7, 15, or 30 days
   */
  public static predictDemand(medicineId: number, periodDays: 7 | 15 | 30): AIPredictionResult {
    const medicine = storage.getMedicineById(medicineId);
    if (!medicine) {
      throw new Error(`Medicine with ID ${medicineId} not found.`);
    }

    const allHistory = storage.getSalesHistory(medicineId);
    // Sort chronologically
    const sortedHistory = [...allHistory].sort(
      (a, b) => new Date(a.sale_date).getTime() - new Date(b.sale_date).getTime()
    );

    // Group sales by unique date
    const dailyMap = new Map<string, number>();
    for (const rec of sortedHistory) {
      const curr = dailyMap.get(rec.sale_date) || 0;
      dailyMap.set(rec.sale_date, curr + rec.quantity_sold);
    }

    const dateList = Array.from(dailyMap.keys()).sort();
    const regressionPoints: { x: number; y: number; date: string }[] = [];

    // Feature Engineering: Day Index (x), Recent Sales (y)
    dateList.forEach((dt, idx) => {
      regressionPoints.push({
        x: idx,
        y: dailyMap.get(dt) || 0,
        date: dt
      });
    });

    // If historical data is scarce, create baseline projection
    let slope = 0;
    let intercept = 5;
    let avgDaily = 5;

    if (regressionPoints.length > 0) {
      const totalUnits = regressionPoints.reduce((acc, p) => acc + p.y, 0);
      avgDaily = totalUnits / regressionPoints.length;

      const reg = this.calculateLinearRegression(regressionPoints);
      slope = reg.slope;
      intercept = reg.intercept;
    }

    // Historical chart data
    const historicalChartData = regressionPoints.map(p => ({
      date: p.date.slice(5), // MM-DD
      actual: p.y,
      predicted: Math.max(0, Math.round(slope * p.x + intercept))
    }));

    // Future projections
    const projectedChartData: { date: string; predicted: number }[] = [];
    let predictedTotalDemand = 0;
    const lastDayIndex = regressionPoints.length > 0 ? regressionPoints.length - 1 : 0;
    const baseDate = new Date();

    for (let day = 1; day <= periodDays; day++) {
      const futureDate = new Date(baseDate);
      futureDate.setDate(baseDate.getDate() + day);
      const dateStr = futureDate.toISOString().split('T')[0].slice(5);

      // Feature calculation: Trend + Moving Day Factor + Day-of-week seasonality
      const dayIndex = lastDayIndex + day;
      const trendValue = slope * dayIndex + intercept;
      const dayOfWeek = futureDate.getDay();
      const weekendFactor = dayOfWeek === 0 || dayOfWeek === 6 ? 1.15 : 1.0;

      const dayPred = Math.max(1, Math.round(trendValue * weekendFactor));
      predictedTotalDemand += dayPred;

      projectedChartData.push({
        date: dateStr,
        predicted: dayPred
      });
    }

    const currentStock = medicine.quantity;
    const netDifference = currentStock - predictedTotalDemand;

    // Trend Direction
    let trendDirection: 'increasing' | 'stable' | 'decreasing' = 'stable';
    if (slope > 0.08) trendDirection = 'increasing';
    else if (slope < -0.08) trendDirection = 'decreasing';

    // Intelligent Stock Review & Recommendations
    let recommendation = '';
    let urgency: 'critical' | 'warning' | 'normal' | 'surplus' = 'normal';

    if (currentStock <= 0) {
      urgency = 'critical';
      recommendation = `CRITICAL OUT OF STOCK: Zero inventory available. Projected demand is ${predictedTotalDemand} units over next ${periodDays} days. Place emergency purchase order immediately with ${medicine.supplier_name || 'supplier'}.`;
    } else if (netDifference < 0) {
      const shortage = Math.abs(netDifference);
      urgency = 'critical';
      recommendation = `HIGH SHORTAGE RISK: Current stock (${currentStock}) is insufficient for forecasted demand (${predictedTotalDemand} units). Deficit of ${shortage} units expected. Immediate purchase reorder recommended.`;
    } else if (netDifference <= medicine.reorder_level) {
      urgency = 'warning';
      recommendation = `STOCK WARNING: Projected buffer will dip below the safety reorder threshold of ${medicine.reorder_level} units within ${periodDays} days. Schedule supplier replenishment soon.`;
    } else if (currentStock > predictedTotalDemand * 3 && currentStock > 100) {
      urgency = 'surplus';
      recommendation = `OVERSTOCK DETECTED: Current stock (${currentStock} units) exceeds 3x the projected ${periodDays}-day demand (${predictedTotalDemand} units). Monitor expiry date (${medicine.expiry_date}) to prevent wastage.`;
    } else {
      urgency = 'normal';
      recommendation = `OPTIMAL INVENTORY: Current inventory of ${currentStock} units comfortably covers projected demand of ${predictedTotalDemand} units over next ${periodDays} days.`;
    }

    return {
      medicine_id: medicine.medicine_id,
      medicine_name: medicine.medicine_name,
      current_stock: currentStock,
      period_days: periodDays,
      predicted_demand: predictedTotalDemand,
      average_daily_demand: Number((predictedTotalDemand / periodDays).toFixed(1)),
      trend_direction: trendDirection,
      recommendation,
      urgency,
      historical_chart_data: historicalChartData.slice(-14), // show last 14 days
      projected_chart_data: projectedChartData
    };
  }
}
