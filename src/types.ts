export interface AcceptanceData {
  fullName: string;
  institution: string;
  department: string;
  matricNo: string;
  date: string;
  referenceNo: string;
  salutation: string;
  signatoryName: string;
  signatoryTitle: string;
  organization: string;
  signatoryContact: string;
  hasLogo: boolean;
  hasSignature: boolean;
  hasQrCode: boolean;
  templateId: string;
  customLogoUrl: string | null;
  customSignatureUrl: string | null;
}

export interface LetterTemplate {
  id: string;
  name: string;
  description: string;
  subject: string;
  renderBody: (data: AcceptanceData) => string;
}

export const LETTER_TEMPLATES: LetterTemplate[] = [
  {
    id: "nhub-default",
    name: "nHub Foundation Official (Internship)",
    description: "The standard official internship acceptance letter issued by nHub Foundation.",
    subject: "ACCEPTANCE LETTER",
    renderBody: (data) => `We acknowledge the receipt of introduction for industrial training (INTERNSHIP) in respect to ${data.fullName || "{{fullName}}"} with matriculation number ${data.matricNo || "{{matricNo}}"} of the Department of ${data.department || "{{department}}"} of ${data.institution || "{{institution}}"} to undergo his/her Industrial Training in our organization.`
  },
  {
    id: "academic-general",
    name: "General Academic Admission",
    description: "A generalized acceptance letter suitable for department or university admissions.",
    subject: "OFFER OF ADMISSION / ACCEPTANCE LETTER",
    renderBody: (data) => `We are pleased to inform you that ${data.fullName || "{{fullName}}"} bearing matriculation/registration number ${data.matricNo || "{{matricNo}}"} has been official accepted into the Department of ${data.department || "{{department}}"} at ${data.institution || "{{institution}}"} for the upcoming academic session. We look forward to your valuable academic contributions.`
  },
  {
    id: "corporate-general",
    name: "General Corporate Employment",
    description: "An official letter acknowledging corporate project training or research engagement.",
    subject: "CORPORATE TRAINING ACCEPTANCE",
    renderBody: (data) => `This letter serves to formally accept ${data.fullName || "{{fullName}}"} from ${data.institution || "{{institution}}"} (${data.department || "{{department}}"}, Matric No: ${data.matricNo || "{{matricNo}}"}) to participate in the professional corporate training program within our organization. The engagement is scheduled in accordance with standard organizational workflows.`
  }
];
