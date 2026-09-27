import * as repository
    from '../repositories/scmReportRepository.js';

export async function getDashboard() {
    return repository.getDashboard();
}