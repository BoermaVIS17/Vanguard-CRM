import PDFDocument from 'pdfkit';
import { Readable } from 'stream';

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
  
  // Signature
  customerSignature?: string; // Base64 data URL
  signatureDate?: Date;
}

export class ProposalPDFGenerator {
  private doc: PDFKit.PDFDocument;
  private data: ProposalData;
  
  // Vanguard Systems (VIS) Colors
  private readonly PRIMARY_COLOR = '#00D4FF'; // Electric Cyan
  private readonly NAVY_BG = '#001F3F'; // Navy Blue
  private readonly DARK_BG = '#1e293b'; // Slate
  private readonly TEXT_COLOR = '#334155';
  private readonly LIGHT_GRAY = '#94a3b8';
  
  constructor(data: ProposalData) {
    this.data = data;
    this.doc = new PDFDocument({
      size: 'LETTER',
      margins: { top: 50, bottom: 50, left: 50, right: 50 },
    });
  }
  
  /**
   * Generate PDF based on deal type
   */
  async generate(): Promise<Buffer> {
    if (this.data.dealType === 'insurance') {
      return this.generateInsuranceProposal();
    } else {
      return this.generateStandardBid();
    }
  }
  
  /**
   * Generate Insurance Contingency Agreement / LOA
   */
  private async generateInsuranceProposal(): Promise<Buffer> {
    // Header
    this.addHeader('CONTINGENCY AGREEMENT & LETTER OF AUTHORIZATION');
    
    // Company Info
    this.addCompanyInfo();
    
    // Customer Info Section
    this.doc.moveDown(2);
    this.doc.fontSize(14).fillColor(this.TEXT_COLOR).font('Helvetica-Bold').text('PROPERTY OWNER INFORMATION');
    this.doc.moveDown(0.5);
    this.addLine();
    this.doc.moveDown(0.5);
    
    this.doc.fontSize(10).font('Helvetica');
    this.doc.text(`Name: ${this.data.customerName}`);
    this.doc.text(`Property Address: ${this.data.propertyAddress}`);
    this.doc.text(`City, State, ZIP: ${this.data.cityStateZip}`);
    if (this.data.customerPhone) this.doc.text(`Phone: ${this.data.customerPhone}`);
    if (this.data.customerEmail) this.doc.text(`Email: ${this.data.customerEmail}`);
    
    // Insurance Info
    this.doc.moveDown(1.5);
    this.doc.fontSize(14).fillColor(this.TEXT_COLOR).font('Helvetica-Bold').text('INSURANCE CLAIM INFORMATION');
    this.doc.moveDown(0.5);
    this.addLine();
    this.doc.moveDown(0.5);
    
    this.doc.fontSize(10).font('Helvetica');
    this.doc.text(`Insurance Carrier: ${this.data.insuranceCarrier || 'N/A'}`);
    this.doc.text(`Claim Number: ${this.data.claimNumber || 'N/A'}`);
    
    // Scope of Work
    this.doc.moveDown(1.5);
    this.doc.fontSize(14).fillColor(this.TEXT_COLOR).font('Helvetica-Bold').text('SCOPE OF WORK');
    this.doc.moveDown(0.5);
    this.addLine();
    this.doc.moveDown(0.5);
    
    this.doc.fontSize(10).font('Helvetica');
    this.doc.text(`Complete roof replacement including all materials and labor.`);
    this.doc.text(`Roof Size: ${this.data.roofSquares.toFixed(1)} squares`);
    
    if (this.data.materials) {
      this.doc.moveDown(0.5);
      this.doc.font('Helvetica-Bold').text('Materials:');
      this.doc.font('Helvetica');
      if (this.data.materials.shingles) this.doc.text(`  • Shingles: ${this.data.materials.shingles} bundles`);
      if (this.data.materials.starter) this.doc.text(`  • Starter Strip: ${this.data.materials.starter} bundles`);
      if (this.data.materials.hipRidge) this.doc.text(`  • Hip & Ridge: ${this.data.materials.hipRidge} bundles`);
      if (this.data.materials.underlayment) this.doc.text(`  • Underlayment: ${this.data.materials.underlayment} rolls`);
      if (this.data.materials.nails) this.doc.text(`  • Nails: ${this.data.materials.nails} lbs`);
      if (this.data.materials.dripEdge) this.doc.text(`  • Drip Edge: ${this.data.materials.dripEdge} pieces`);
      if (this.data.materials.pipeBoots) this.doc.text(`  • Pipe Boots: ${this.data.materials.pipeBoots} pieces`);
      if (this.data.materials.paint) this.doc.text(`  • Paint: ${this.data.materials.paint} gallons`);
      if (this.data.materials.gooseNecks) this.doc.text(`  • Goose Necks: ${this.data.materials.gooseNecks} pieces`);
    }
    
    // Pricing
    this.doc.moveDown(1.5);
    this.doc.fontSize(14).fillColor(this.TEXT_COLOR).font('Helvetica-Bold').text('PRICING');
    this.doc.moveDown(0.5);
    this.addLine();
    this.doc.moveDown(0.5);
    
    this.doc.fontSize(10).font('Helvetica');
    this.doc.text(`Price Per Square: $${this.data.pricePerSq.toFixed(2)}`);
    this.doc.text(`Total Squares: ${this.data.roofSquares.toFixed(1)}`);
    this.doc.moveDown(0.5);
    
    // Total Price Box
    this.doc.rect(this.doc.x, this.doc.y, 500, 40).fillAndStroke('#f0fdf4', '#10b981');
    this.doc.fontSize(16).fillColor('#065f46').font('Helvetica-Bold');
    this.doc.text(`TOTAL PROJECT COST: $${this.data.totalPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, 
      this.doc.x + 10, this.doc.y - 25);
    this.doc.moveDown(2);
    
    // Contingency Terms
    this.doc.fontSize(14).fillColor(this.TEXT_COLOR).font('Helvetica-Bold').text('CONTINGENCY TERMS');
    this.doc.moveDown(0.5);
    this.addLine();
    this.doc.moveDown(0.5);
    
    this.doc.fontSize(9).font('Helvetica');
    this.doc.text('This agreement is CONTINGENT upon the insurance carrier approving the claim and providing payment for the work described above. The property owner agrees to:', { align: 'left' });
    this.doc.moveDown(0.5);
    this.doc.list([
      'Assign insurance proceeds to the contractor for work performed',
      'Pay any deductible amount directly to the contractor upon project completion',
      'Cooperate with the contractor in all insurance claim matters',
      'Allow contractor to act as their representative in negotiations with the insurance carrier',
    ], { bulletRadius: 2, bulletIndent: 10, textIndent: 20 });
    
    // Letter of Authorization
    this.doc.addPage();
    this.doc.fontSize(16).fillColor(this.TEXT_COLOR).font('Helvetica-Bold').text('LETTER OF AUTHORIZATION', { align: 'center' });
    this.doc.moveDown(1);
    
    this.doc.fontSize(10).font('Helvetica');
    this.doc.text(`I, ${this.data.customerName}, hereby authorize ${this.data.companyName || 'NextDoor Exterior Solutions'} to act as my representative in all matters related to my insurance claim for roof damage at the property located at ${this.data.propertyAddress}.`, { align: 'justify' });
    this.doc.moveDown(1);
    
    this.doc.text('This authorization includes, but is not limited to:', { align: 'left' });
    this.doc.moveDown(0.5);
    this.doc.list([
      'Communicating with my insurance carrier and adjuster',
      'Reviewing and negotiating the insurance estimate',
      'Requesting supplemental payments for additional damages discovered',
      'Receiving payment on my behalf for work performed',
      'Signing documents necessary to complete the claim process',
    ], { bulletRadius: 2, bulletIndent: 10, textIndent: 20 });
    
    // Signature Section
    this.addSignatureSection();
    
    // Footer
    this.addFooter();
    
    return this.finalize();
  }
  
  /**
   * Generate Standard Bid for Cash/Financed Deals
   */
  private async generateStandardBid(): Promise<Buffer> {
    // Header
    this.addHeader('ROOFING PROPOSAL');
    
    // Company Info
    this.addCompanyInfo();
    
    // Customer Info Section
    this.doc.moveDown(2);
    this.doc.fontSize(14).fillColor(this.TEXT_COLOR).font('Helvetica-Bold').text('PREPARED FOR');
    this.doc.moveDown(0.5);
    this.addLine();
    this.doc.moveDown(0.5);
    
    this.doc.fontSize(10).font('Helvetica');
    this.doc.text(`Name: ${this.data.customerName}`);
    this.doc.text(`Property Address: ${this.data.propertyAddress}`);
    this.doc.text(`City, State, ZIP: ${this.data.cityStateZip}`);
    if (this.data.customerPhone) this.doc.text(`Phone: ${this.data.customerPhone}`);
    if (this.data.customerEmail) this.doc.text(`Email: ${this.data.customerEmail}`);
    
    // Proposal Details
    this.doc.moveDown(1.5);
    this.doc.fontSize(14).fillColor(this.TEXT_COLOR).font('Helvetica-Bold').text('PROPOSAL DETAILS');
    this.doc.moveDown(0.5);
    this.addLine();
    this.doc.moveDown(0.5);
    
    this.doc.fontSize(10).font('Helvetica');
    this.doc.text(`Proposal Date: ${this.data.proposalDate.toLocaleDateString()}`);
    if (this.data.validUntil) {
      this.doc.text(`Valid Until: ${this.data.validUntil.toLocaleDateString()}`);
    }
    
    // Scope of Work
    this.doc.moveDown(1.5);
    this.doc.fontSize(14).fillColor(this.TEXT_COLOR).font('Helvetica-Bold').text('SCOPE OF WORK');
    this.doc.moveDown(0.5);
    this.addLine();
    this.doc.moveDown(0.5);
    
    this.doc.fontSize(10).font('Helvetica');
    this.doc.text('Complete roof replacement including:', { continued: false });
    this.doc.moveDown(0.5);
    this.doc.list([
      'Removal of existing roofing materials',
      'Inspection of roof decking and replacement if necessary',
      'Installation of ice & water shield in valleys and eaves',
      'Installation of synthetic underlayment',
      'Installation of new architectural shingles',
      'Installation of new drip edge and flashing',
      'Installation of new ridge vent system',
      'Complete cleanup and debris removal',
      'Final inspection and warranty documentation',
    ], { bulletRadius: 2, bulletIndent: 10, textIndent: 20 });
    
    this.doc.moveDown(0.5);
    this.doc.text(`Roof Size: ${this.data.roofSquares.toFixed(1)} squares`);
    
    // Materials Breakdown
    if (this.data.materials) {
      this.doc.moveDown(1.5);
      this.doc.fontSize(14).fillColor(this.TEXT_COLOR).font('Helvetica-Bold').text('MATERIALS');
      this.doc.moveDown(0.5);
      this.addLine();
      this.doc.moveDown(0.5);
      
      this.doc.fontSize(10).font('Helvetica');
      if (this.data.materials.shingles) this.doc.text(`Shingles: ${this.data.materials.shingles} bundles`);
      if (this.data.materials.starter) this.doc.text(`Starter Strip: ${this.data.materials.starter} bundles`);
      if (this.data.materials.hipRidge) this.doc.text(`Hip & Ridge: ${this.data.materials.hipRidge} bundles`);
      if (this.data.materials.underlayment) this.doc.text(`Underlayment: ${this.data.materials.underlayment} rolls`);
      if (this.data.materials.nails) this.doc.text(`Nails: ${this.data.materials.nails} lbs`);
      if (this.data.materials.dripEdge) this.doc.text(`Drip Edge: ${this.data.materials.dripEdge} pieces`);
      if (this.data.materials.pipeBoots) this.doc.text(`Pipe Boots: ${this.data.materials.pipeBoots} pieces`);
      if (this.data.materials.paint) this.doc.text(`Paint: ${this.data.materials.paint} gallons`);
      if (this.data.materials.gooseNecks) this.doc.text(`Goose Necks: ${this.data.materials.gooseNecks} pieces`);
    }
    
    // Pricing Breakdown
    this.doc.moveDown(1.5);
    this.doc.fontSize(14).fillColor(this.TEXT_COLOR).font('Helvetica-Bold').text('INVESTMENT');
    this.doc.moveDown(0.5);
    this.addLine();
    this.doc.moveDown(0.5);
    
    // Pricing Table
    const tableTop = this.doc.y;
    const col1 = 50;
    const col2 = 400;
    
    this.doc.fontSize(10).font('Helvetica-Bold');
    this.doc.text('Description', col1, tableTop);
    this.doc.text('Amount', col2, tableTop, { align: 'right', width: 100 });
    
    this.doc.moveDown(0.5);
    this.addLine();
    this.doc.moveDown(0.5);
    
    this.doc.font('Helvetica');
    this.doc.text(`Roof Replacement (${this.data.roofSquares.toFixed(1)} squares @ $${this.data.pricePerSq.toFixed(2)}/sq)`, col1);
    this.doc.text(`$${this.data.totalPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, col2, this.doc.y - 12, { align: 'right', width: 100 });
    
    this.doc.moveDown(1);
    this.addLine();
    this.doc.moveDown(0.5);
    
    // Total Box
    this.doc.rect(col1, this.doc.y, 500, 40).fillAndStroke('#f0fdf4', '#10b981');
    this.doc.fontSize(16).fillColor('#065f46').font('Helvetica-Bold');
    this.doc.text('TOTAL INVESTMENT:', col1 + 10, this.doc.y - 25);
    this.doc.text(`$${this.data.totalPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, col2, this.doc.y, { align: 'right', width: 100 });
    this.doc.moveDown(2);
    
    // Payment Terms
    this.doc.fontSize(14).fillColor(this.TEXT_COLOR).font('Helvetica-Bold').text('PAYMENT TERMS');
    this.doc.moveDown(0.5);
    this.addLine();
    this.doc.moveDown(0.5);
    
    this.doc.fontSize(10).font('Helvetica');
    
    if (this.data.dealType === 'cash') {
      this.doc.text('Payment Schedule (Cash):', { underline: true });
      this.doc.moveDown(0.5);
      this.doc.list([
        `Deposit: $${(this.data.totalPrice * 0.10).toLocaleString('en-US', { minimumFractionDigits: 2 })} (10%) - Due upon contract signing`,
        `Progress Payment: $${(this.data.totalPrice * 0.40).toLocaleString('en-US', { minimumFractionDigits: 2 })} (40%) - Due when materials are delivered`,
        `Final Payment: $${(this.data.totalPrice * 0.50).toLocaleString('en-US', { minimumFractionDigits: 2 })} (50%) - Due upon project completion`,
      ], { bulletRadius: 2, bulletIndent: 10, textIndent: 20 });
    } else if (this.data.dealType === 'financed') {
      this.doc.text('Payment Schedule (Financed):', { underline: true });
      this.doc.moveDown(0.5);
      this.doc.text('This project will be financed through our approved lending partners. No upfront payment required. Financing terms will be determined based on credit approval.', { align: 'justify' });
      this.doc.moveDown(0.5);
      this.doc.list([
        'Competitive interest rates starting at 0% APR (with approved credit)',
        'Flexible payment terms from 12 to 120 months',
        'No prepayment penalties',
        'Quick approval process (usually within 24 hours)',
      ], { bulletRadius: 2, bulletIndent: 10, textIndent: 20 });
    }
    
    // Warranty & Terms
    this.doc.addPage();
    this.doc.fontSize(14).fillColor(this.TEXT_COLOR).font('Helvetica-Bold').text('WARRANTY & GUARANTEES');
    this.doc.moveDown(0.5);
    this.addLine();
    this.doc.moveDown(0.5);
    
    this.doc.fontSize(10).font('Helvetica');
    this.doc.list([
      'Manufacturer\'s Warranty: Lifetime limited warranty on shingles',
      'Workmanship Warranty: 10-year warranty on labor and installation',
      'Leak-Free Guarantee: We guarantee a leak-free roof or we\'ll fix it at no charge',
      'Satisfaction Guarantee: Your complete satisfaction is our priority',
    ], { bulletRadius: 2, bulletIndent: 10, textIndent: 20 });
    
    this.doc.moveDown(1.5);
    this.doc.fontSize(14).fillColor(this.TEXT_COLOR).font('Helvetica-Bold').text('TERMS & CONDITIONS');
    this.doc.moveDown(0.5);
    this.addLine();
    this.doc.moveDown(0.5);
    
    this.doc.fontSize(9).font('Helvetica');
    this.doc.list([
      'This proposal is valid for 30 days from the date above',
      'Work will commence within 2 weeks of contract signing, weather permitting',
      'Project timeline: 1-3 days depending on roof size and complexity',
      'All work will be performed in accordance with local building codes',
      'Permits and inspections are included in the price',
      'Any changes to the scope of work must be approved in writing',
      'Customer is responsible for moving vehicles and outdoor furniture',
      'We are fully licensed, bonded, and insured',
    ], { bulletRadius: 1.5, bulletIndent: 10, textIndent: 20 });
    
    // Signature Section
    this.addSignatureSection();
    
    // Footer
    this.addFooter();
    
    return this.finalize();
  }
  
  /**
   * Add company header
   */
  private addHeader(title: string) {
    // Company Logo Area (placeholder)
    this.doc.fontSize(24).fillColor(this.PRIMARY_COLOR).font('Helvetica-Bold');
    this.doc.text(this.data.companyName || 'NextDoor Exterior Solutions', { align: 'center' });
    
    this.doc.moveDown(0.5);
    this.doc.fontSize(18).fillColor(this.TEXT_COLOR).font('Helvetica-Bold');
    this.doc.text(title, { align: 'center' });
    
    this.doc.moveDown(1);
    this.addLine();
  }
  
  /**
   * Add company information
   */
  private addCompanyInfo() {
    this.doc.moveDown(1);
    this.doc.fontSize(10).fillColor(this.LIGHT_GRAY).font('Helvetica');
    
    if (this.data.companyAddress) {
      this.doc.text(this.data.companyAddress, { align: 'center' });
    }
    if (this.data.companyPhone) {
      this.doc.text(`Phone: ${this.data.companyPhone}`, { align: 'center' });
    }
    if (this.data.companyEmail) {
      this.doc.text(`Email: ${this.data.companyEmail}`, { align: 'center' });
    }
    if (this.data.companyLicense) {
      this.doc.text(`License: ${this.data.companyLicense}`, { align: 'center' });
    }
  }
  
  /**
   * Add signature section
   */
  private addSignatureSection() {
    this.doc.moveDown(3);
    
    // Customer Signature
    this.doc.fontSize(10).fillColor(this.TEXT_COLOR).font('Helvetica-Bold');
    this.doc.text('CUSTOMER ACCEPTANCE');
    this.doc.moveDown(0.5);
    
    this.doc.font('Helvetica');
    this.doc.text('By signing below, I accept the terms and conditions outlined in this proposal.');
    this.doc.moveDown(2);
    
    // Customer Signature Area
    const signatureY = this.doc.y;
    
    // If signature image provided, embed it
    if (this.data.customerSignature) {
      try {
        // Convert base64 data URL to buffer
        const base64Data = this.data.customerSignature.replace(/^data:image\/\w+;base64,/, '');
        const imageBuffer = Buffer.from(base64Data, 'base64');
        
        // Embed signature image
        this.doc.image(imageBuffer, 50, signatureY - 40, {
          width: 200,
          height: 60,
          fit: [200, 60],
        });
        
        // Add date if provided
        if (this.data.signatureDate) {
          this.doc.fontSize(9).fillColor(this.LIGHT_GRAY);
          this.doc.text(
            this.data.signatureDate.toLocaleDateString(),
            350,
            signatureY - 20
          );
        }
      } catch (error) {
        console.error('Error embedding signature:', error);
        // Fall back to signature line
        this.doc.moveTo(50, signatureY).lineTo(250, signatureY).stroke();
      }
    } else {
      // No signature - draw line
      this.doc.moveTo(50, signatureY).lineTo(250, signatureY).stroke();
    }
    
    // Draw date line
    this.doc.moveTo(350, signatureY).lineTo(550, signatureY).stroke();
    
    this.doc.fontSize(9).fillColor(this.LIGHT_GRAY);
    this.doc.text('Customer Signature', 50, signatureY + 5);
    this.doc.text('Date', 350, signatureY + 5);
    
    this.doc.moveDown(3);
    
    // Contractor Signature
    const contractorY = this.doc.y;
    this.doc.moveTo(50, contractorY).lineTo(250, contractorY).stroke();
    this.doc.moveTo(350, contractorY).lineTo(550, contractorY).stroke();
    
    this.doc.text('Contractor Signature', 50, contractorY + 5);
    this.doc.text('Date', 350, contractorY + 5);
  }
  
  /**
   * Add footer to all pages
   */
  private addFooter() {
    const pages = this.doc.bufferedPageRange();
    for (let i = 0; i < pages.count; i++) {
      this.doc.switchToPage(i);
      
      this.doc.fontSize(8).fillColor(this.LIGHT_GRAY).font('Helvetica');
      this.doc.text(
        `Page ${i + 1} of ${pages.count}`,
        50,
        this.doc.page.height - 50,
        { align: 'center' }
      );
      
      this.doc.text(
        `Generated on ${new Date().toLocaleDateString()}`,
        50,
        this.doc.page.height - 35,
        { align: 'center' }
      );
    }
  }
  
  /**
   * Add horizontal line
   */
  private addLine() {
    const y = this.doc.y;
    this.doc.moveTo(50, y).lineTo(550, y).stroke(this.LIGHT_GRAY);
  }
  
  /**
   * Finalize and return PDF buffer
   */
  private finalize(): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];
      
      this.doc.on('data', (chunk) => chunks.push(chunk));
      this.doc.on('end', () => resolve(Buffer.concat(chunks)));
      this.doc.on('error', reject);
      
      this.doc.end();
    });
  }
}

/**
 * Helper function to generate proposal PDF
 */
export async function generateProposalPDF(data: ProposalData): Promise<Buffer> {
  const generator = new ProposalPDFGenerator(data);
  return generator.generate();
}
