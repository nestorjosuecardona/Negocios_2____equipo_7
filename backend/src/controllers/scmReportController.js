import * as service
    from '../services/scmReportService.js';

export async function dashboard(
    req,
    res,
) {
    const data =
        await service.getDashboard();

    res.json(data);
}