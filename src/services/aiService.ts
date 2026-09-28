/**
 * CuraMed AI Clinical Services
 * Communicates with server-side Gemini 3.8 Flash endpoints
 */

export interface AIPharmacistMessage {
  role: 'user' | 'model';
  content: string;
}

export interface DrugInteractionResult {
  overallRisk: 'Low' | 'Moderate' | 'High' | 'Severe' | string;
  summary: string;
  interactions: Array<{
    drugs: string[];
    severity: string;
    mechanism: string;
    advice: string;
  }>;
  timingSchedule?: Array<{
    timeSlot: string;
    drugsToTake: string[];
    instructions: string;
  }>;
}

export interface ScannedPrescriptionResult {
  doctor: {
    name: string;
    qualification?: string;
    registrationNumber: string;
    hospitalOrClinic: string;
    prescriptionDate?: string;
  };
  patient: {
    name: string;
    age?: string;
    gender?: string;
    diagnosis: string;
  };
  prescribedMedicines: Array<{
    brandName: string;
    salt: string;
    dosageForm: string;
    strength?: string;
    dosageRegimen: string;
    durationDays?: number;
    clinicalInstruction?: string;
    requiresColdChain?: boolean;
    matchedCatalogId?: string;
  }>;
  clinicalWarnings: string[];
  verifiedComplianceBadge?: string;
}

export interface GenericSubstituteResult {
  brandName: string;
  salt: string;
  brandPrice: number;
  genericPrice: number;
  savingsPercentage: number;
  genericAlternatives: Array<{
    name: string;
    manufacturer: string;
    price: number;
    certification: string;
  }>;
  clinicalEquivalenceNote: string;
}

export async function askAIPharmacist(
  message: string,
  history: AIPharmacistMessage[] = [],
  context: { currentMedicines?: string[] } = {}
): Promise<{ reply: string; source?: string }> {
  const res = await fetch('/api/ai/pharmacist-chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, history, context }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to consult AI Pharmacist');
  }

  return res.json();
}

export async function checkDrugInteractions(medicines: string[]): Promise<DrugInteractionResult> {
  const res = await fetch('/api/ai/analyze-interactions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ medicines }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to analyze drug interactions');
  }

  return res.json();
}

export async function scanPrescription(options: {
  imageBase64?: string;
  mimeType?: string;
  textContent?: string;
}): Promise<ScannedPrescriptionResult> {
  const res = await fetch('/api/ai/scan-prescription', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(options),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to scan prescription');
  }

  return res.json();
}

export async function getGenericSubstitutes(
  medicineName: string,
  salt?: string
): Promise<GenericSubstituteResult> {
  const res = await fetch('/api/ai/generic-substitutes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ medicineName, salt }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to find generic substitutes');
  }

  return res.json();
}
