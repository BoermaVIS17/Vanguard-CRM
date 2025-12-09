# PDF Proposal Generator

## Overview
Comprehensive PDF generation system for roofing proposals with two-stage logic based on deal type.

## Features

### **Two-Stage Proposal Logic**

#### **1. Insurance Deals → Contingency Agreement & LOA**
- **Document Type:** Contingency Agreement + Letter of Authorization
- **Purpose:** Required for insurance claim work
- **Includes:**
  - Property owner information
  - Insurance claim details (carrier, claim number)
  - Scope of work with materials list
  - Pricing breakdown
  - Contingency terms (payment dependent on insurance approval)
  - Letter of Authorization for contractor to represent homeowner
  - Signature sections for both parties

#### **2. Cash/Financed Deals → Standard Bid**
- **Document Type:** Professional Roofing Proposal
- **Purpose:** Direct customer sales
- **Includes:**
  - Customer information
  - Detailed scope of work
  - Materials breakdown
  - Investment/pricing section
  - Payment terms (different for cash vs financed)
  - Warranty & guarantees
  - Terms & conditions
  - Signature sections

---

## Installation

### **1. Install Dependencies**

```bash
npm install pdfkit
npm install --save-dev @types/pdfkit
```

### **2. Enable PDF Generation**

In `server/routers.ts`, uncomment the PDF generation code:

```typescript
// Generate PDF
const { generateProposalPDF } = await import('./lib/pdfGenerator');
const pdfBuffer = await generateProposalPDF(proposalData);

// Return PDF for download
ctx.res.setHeader('Content-Type', 'application/pdf');
ctx.res.setHeader('Content-Disposition', `attachment; filename="proposal-${input.jobId}.pdf"`);
ctx.res.send(pdfBuffer);
```

---

## Usage

### **From ProposalCalculator Component**

```typescript
// User clicks "Generate Contract" button
const generateProposal = trpc.crm.generateProposal.useMutation({
  onSuccess: (data) => {
    // PDF downloaded automatically
    toast.success("Proposal PDF generated successfully!");
  },
});

// Trigger generation
generateProposal.mutate({ jobId });
```

### **Server-Side**

```typescript
import { generateProposalPDF } from './lib/pdfGenerator';

const proposalData = {
  customerName: "John Doe",
  propertyAddress: "123 Main St",
  cityStateZip: "Dallas, TX 75001",
  totalPrice: 15000,
  pricePerSq: 500,
  roofSquares: 30,
  dealType: "insurance", // or "cash" or "financed"
  insuranceCarrier: "State Farm",
  claimNumber: "CLM-12345",
  proposalDate: new Date(),
  // ... other fields
};

const pdfBuffer = await generateProposalPDF(proposalData);
```

---

## PDF Structure

### **Insurance Proposal (Contingency Agreement)**

```
Page 1:
├─ Header (Company Name + Title)
├─ Company Information
├─ Property Owner Information
├─ Insurance Claim Information
├─ Scope of Work
│  ├─ Description
│  ├─ Roof Size
│  └─ Materials List
├─ Pricing
│  ├─ Price Per Square
│  ├─ Total Squares
│  └─ Total Project Cost (highlighted)
└─ Contingency Terms
   ├─ Payment contingent on insurance approval
   ├─ Deductible payment terms
   ├─ Cooperation requirements
   └─ Contractor representation authorization

Page 2:
├─ Letter of Authorization
│  ├─ Authorization statement
│  ├─ Scope of authorization
│  └─ List of authorized actions
├─ Signature Section
│  ├─ Customer signature & date
│  └─ Contractor signature & date
└─ Footer (page numbers, generation date)
```

### **Standard Bid (Cash/Financed)**

```
Page 1:
├─ Header (Company Name + Title)
├─ Company Information
├─ Prepared For (Customer Info)
├─ Proposal Details (dates, validity)
├─ Scope of Work
│  ├─ Detailed work description
│  ├─ 9-point checklist
│  └─ Roof size
├─ Materials Breakdown
│  ├─ Shingles
│  ├─ Underlayment
│  ├─ Accessories
│  └─ Other materials
├─ Investment Section
│  ├─ Pricing table
│  └─ Total Investment (highlighted)
└─ Payment Terms
   ├─ Cash: 10% deposit, 40% on delivery, 50% on completion
   └─ Financed: 0% APR options, flexible terms

Page 2:
├─ Warranty & Guarantees
│  ├─ Manufacturer warranty (lifetime)
│  ├─ Workmanship warranty (10 years)
│  ├─ Leak-free guarantee
│  └─ Satisfaction guarantee
├─ Terms & Conditions
│  ├─ Proposal validity (30 days)
│  ├─ Project timeline
│  ├─ Permits & inspections
│  └─ Customer responsibilities
├─ Signature Section
│  ├─ Customer acceptance
│  └─ Contractor signature
└─ Footer
```

---

## Customization

### **Company Branding**

Update default values in `pdfGenerator.ts`:

```typescript
const proposalData = {
  companyName: "Your Company Name",
  companyAddress: "123 Business St, City, ST 12345",
  companyPhone: "(555) 123-4567",
  companyEmail: "info@yourcompany.com",
  companyLicense: "License #123456",
  // ...
};
```

### **Colors**

Modify color constants:

```typescript
private readonly PRIMARY_COLOR = '#00d4aa';  // Teal
private readonly DARK_BG = '#1e293b';        // Dark slate
private readonly TEXT_COLOR = '#334155';     // Slate
private readonly LIGHT_GRAY = '#94a3b8';     // Light slate
```

### **Payment Terms**

Edit payment schedules in `generateStandardBid()`:

```typescript
// Cash payment schedule
Deposit: 10% - Due upon signing
Progress: 40% - Due on material delivery
Final: 50% - Due on completion

// Financed terms
0% APR options with approved credit
12-120 month terms
No prepayment penalties
```

---

## API Reference

### **ProposalData Interface**

```typescript
interface ProposalData {
  // Customer Info
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  propertyAddress: string;
  cityStateZip: string;
  
  // Pricing
  totalPrice: number;
  pricePerSq: number;
  roofSquares: number;
  
  // Deal Type
  dealType: 'insurance' | 'cash' | 'financed';
  insuranceCarrier?: string;
  claimNumber?: string;
  
  // Materials (optional)
  materials?: {
    shingles?: number;
    starter?: number;
    hipRidge?: number;
    underlayment?: number;
    nails?: number;
    dripEdge?: number;
    pipeBoots?: number;
    paint?: number;
    gooseNecks?: number;
  };
  
  // Company Info
  companyName?: string;
  companyAddress?: string;
  companyPhone?: string;
  companyEmail?: string;
  companyLicense?: string;
  
  // Dates
  proposalDate: Date;
  validUntil?: Date;
}
```

### **generateProposalPDF()**

```typescript
async function generateProposalPDF(data: ProposalData): Promise<Buffer>
```

**Returns:** PDF as Buffer for download or storage

**Example:**
```typescript
const pdfBuffer = await generateProposalPDF(proposalData);

// Save to file
fs.writeFileSync('proposal.pdf', pdfBuffer);

// Send as HTTP response
res.setHeader('Content-Type', 'application/pdf');
res.send(pdfBuffer);

// Upload to cloud storage
await uploadToS3(pdfBuffer, 'proposals/job-123.pdf');
```

---

## Testing

### **Test Insurance Proposal**

```typescript
const testData = {
  customerName: "Jane Smith",
  propertyAddress: "456 Oak Ave",
  cityStateZip: "Houston, TX 77001",
  totalPrice: 18500,
  pricePerSq: 475,
  roofSquares: 38.9,
  dealType: "insurance",
  insuranceCarrier: "Allstate",
  claimNumber: "CLM-98765",
  proposalDate: new Date(),
};

const pdf = await generateProposalPDF(testData);
// Should generate Contingency Agreement + LOA
```

### **Test Cash Proposal**

```typescript
const testData = {
  customerName: "Bob Johnson",
  propertyAddress: "789 Pine Rd",
  cityStateZip: "Austin, TX 78701",
  totalPrice: 12000,
  pricePerSq: 500,
  roofSquares: 24,
  dealType: "cash",
  proposalDate: new Date(),
  validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
};

const pdf = await generateProposalPDF(testData);
// Should generate Standard Bid with cash payment terms
```

### **Test Financed Proposal**

```typescript
const testData = {
  customerName: "Alice Williams",
  propertyAddress: "321 Elm St",
  cityStateZip: "San Antonio, TX 78201",
  totalPrice: 22000,
  pricePerSq: 550,
  roofSquares: 40,
  dealType: "financed",
  proposalDate: new Date(),
};

const pdf = await generateProposalPDF(testData);
// Should generate Standard Bid with financing terms
```

---

## Troubleshooting

### **"Cannot find module 'pdfkit'"**

**Solution:** Install pdfkit
```bash
npm install pdfkit @types/pdfkit
```

### **PDF Generation Fails**

**Check:**
1. All required fields are provided
2. `priceStatus` is "approved"
3. Roof area data exists
4. Deal type is valid ('insurance', 'cash', or 'financed')

### **Fonts Not Rendering**

**Solution:** PDFKit includes standard fonts (Helvetica, Times, Courier). For custom fonts:
```typescript
doc.font('path/to/custom-font.ttf');
```

---

## Future Enhancements

### **Planned Features:**
- [ ] Company logo upload and embedding
- [ ] Custom color schemes per company
- [ ] Digital signature integration
- [ ] Email delivery of PDFs
- [ ] Cloud storage integration (S3, Google Drive)
- [ ] Multi-language support
- [ ] Custom template builder
- [ ] Proposal versioning
- [ ] Customer portal for viewing/signing

### **Advanced Customization:**
- [ ] Conditional sections based on job type
- [ ] Dynamic material pricing tables
- [ ] Photo gallery integration
- [ ] Interactive PDF forms
- [ ] QR codes for online signing
- [ ] Watermarks for draft proposals

---

## License & Compliance

### **Legal Considerations:**
- Ensure all terms comply with local contracting laws
- Include required license numbers and insurance info
- Verify contingency agreement language with legal counsel
- Update warranty terms to match actual coverage

### **Document Retention:**
- Store generated PDFs for minimum 7 years
- Maintain audit trail of proposal versions
- Track customer signatures and acceptance dates
- Comply with state-specific record keeping requirements

---

## Support

For issues or questions:
1. Check this README
2. Review `pdfGenerator.ts` code comments
3. Test with sample data
4. Contact development team

---

**Status:** ✅ Ready for production (pending pdfkit installation)
**Version:** 1.0.0
**Last Updated:** December 2025
