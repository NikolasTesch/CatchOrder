import { Request, Response } from 'express';
import { MetricsModel } from '../models/metricsModel';

class MetricsController {
  async getInsights(req: Request, res: Response): Promise<Response> {
    try {
      // Default to last 30 days if not provided
      const endDate = (req.query.endDate as string) || new Date().toISOString();
      const startDate =
        (req.query.startDate as string) ||
        new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

      const [hourlySales, productPerformance, waiterPerformance, summary] =
        await Promise.all([
          MetricsModel.getHourlySales(startDate, endDate),
          MetricsModel.getProductPerformance(startDate, endDate),
          MetricsModel.getWaiterPerformance(startDate, endDate),
          MetricsModel.getSummary(startDate, endDate),
        ]);

      // Calculate ABC Classification
      // A: Top 80% revenue
      // B: Next 15%
      // C: Last 5%
      const totalProductRevenue = productPerformance.reduce(
        (acc, p) => acc + p.revenue,
        0,
      );
      let accumulatedRevenue = 0;

      const abcCurve = productPerformance.map((p) => {
        accumulatedRevenue += p.revenue;
        const percentage = (accumulatedRevenue / totalProductRevenue) * 100;
        let classification = 'C';
        if (percentage <= 80) classification = 'A';
        else if (percentage <= 95) classification = 'B';

        return {
          ...p,
          classification,
          revenue_share: (p.revenue / totalProductRevenue) * 100,
        };
      });

      return res.status(200).json({
        data: {
          period: { startDate, endDate },
          summary,
          hourlySales,
          abcCurve,
          waiterPerformance,
        },
      });
    } catch (error) {
      console.error('Error fetching metrics:', error);
      return res.status(500).json({
        message: 'Erro ao buscar métricas',
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      });
    }
  }
}

export default new MetricsController();
