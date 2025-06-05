// Exportar tipos e gerenciador de banco de dados local
export { localDbManager } from "./local-db"
export type { Patient, Staff } from "./local-db"

// Exportar funções do serviço de pacientes
export {
  calculatePriority,
  calculateWaitTime,
  generatePatientId,
  registerPatient,
  getAllPatients,
  getPatientById,
  updatePatient,
  archivePatient,
  getAllArchivedPatients,
  requestReevaluation,
  markReevaluationAsSeen,
  updatePatientStep,
} from "./patient-service"

// Exportar funções do serviço de funcionários
export {
  generateStaffId,
  usernameExists,
  registerStaff,
  getAllStaff,
  getStaffById,
  updateStaff,
  deleteStaff,
} from "./staff-service"
