import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import fetch from 'node-fetch';

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
  policyNumber?: string;
  claimNumber?: string;
  deductible?: number;
  
  // Materials (optional)
  shingleColor?: string;
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

/**
 * Template URLs - Update these with your actual Supabase URLs
 */
const TEMPLATE_URLS = {
  // LOA Template for Insurance deals
  loa: process.env.LOA_TEMPLATE_URL || 
    'https://your-project.supabase.co/storage/v1/object/public/templates/loa_template.pdf',
  
  // Scope Template for Cash/Financed deals
  scope: process.env.SCOPE_TEMPLATE_URL || 
    'https://your-project.supabase.co/storage/v1/object/public/templates/scope_template.pdf',
};

/**
 * PDF Form Filler - Fills specific PDF templates with job data
 */
export class PDFFormFiller {
  private data: ProposalData;

  constructor(data: ProposalData) {
    this.data = data;
  }

  /**
   * Main generation method - routes to appropriate template
   */
  async generate(): Promise<Buffer> {
    if (this.data.dealType === 'insurance') {
      return this.fillLOATemplate();
    } else {
      return this.fillScopeTemplate();
    }
  }

  /**
   * Fill LOA Template (Insurance deals)
   */
  private async fillLOATemplate(): Promise<Buffer> {
    try {
      // Fetch template
      const templateBytes = await this.fetchTemplate(TEMPLATE_URLS.loa);
      
      // Load PDF
      const pdfDoc = await PDFDocument.load(templateBytes);
      const pages = pdfDoc.getPages();
      
      // Embed fonts
      const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      
      // PAGE 1: Customer and Insurance Info
      const page1 = pages[0];
      
      // Customer Name
      page1.drawText(this.data.customerName, {
        x: 180,
        y: 385,
        size: 11,
        font: helvetica,
        color: rgb(0, 0, 0),
      });
      
      // Property Address
      page1.drawText(this.data.propertyAddress, {
        x: 180,
        y: 360,
        size: 11,
        font: helvetica,
        color: rgb(0, 0, 0),
      });
      
      // Insurance Company
      if (this.data.insuranceCarrier) {
        page1.drawText(this.data.insuranceCarrier, {
          x: 180,
          y: 310,
          size: 11,
          font: helvetica,
          color: rgb(0, 0, 0),
        });
      }
      
      // Policy Number
      if (this.data.policyNumber) {
        page1.drawText(this.data.policyNumber, {
          x: 400,
          y: 310,
          size: 11,
          font: helvetica,
          color: rgb(0, 0, 0),
        });
      }
      
      // PAGE 5: Signature and Date
      if (pages.length >= 5) {
        const page5 = pages[4]; // 0-indexed
        
        // Embed signature if provided
        if (this.data.customerSignature) {
          await this.embedSignature(pdfDoc, page5, 100, 160, 0.5);
        }
        
        // Date
        if (this.data.signatureDate) {
          page5.drawText(this.data.signatureDate.toLocaleDateString(), {
            x: 100,
            y: 120,
            size: 10,
            font: helvetica,
            color: rgb(0, 0, 0),
          });
        }
      }
      
      // Save and return
      const pdfBytes = await pdfDoc.save();
      return Buffer.from(pdfBytes);
      
    } catch (error) {
      console.error('Error filling LOA template:', error);
      throw new Error(`LOA template filling failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Fill Scope Template (Cash/Financed deals)
   */
  private async fillScopeTemplate(): Promise<Buffer> {
    try {
      // Fetch template
      const templateBytes = await this.fetchTemplate(TEMPLATE_URLS.scope);
      
      // Load PDF
      const pdfDoc = await PDFDocument.load(templateBytes);
      const pages = pdfDoc.getPages();
      
      // Embed fonts
      const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      
      // PAGE 1: Name and Address
      const page1 = pages[0];
      
      // Name
      page1.drawText(this.data.customerName, {
        x: 80,
        y: 620,
        size: 11,
        font: helvetica,
        color: rgb(0, 0, 0),
      });
      
      // Address
      page1.drawText(this.data.propertyAddress, {
        x: 300,
        y: 620,
        size: 11,
        font: helvetica,
        color: rgb(0, 0, 0),
      });
      
      // PAGE 2: Shingle Color, Total Cost, and Checkboxes
      if (pages.length >= 2) {
        const page2 = pages[1];
        
        // Shingle Color (Section 3)
        if (this.data.shingleColor) {
          page2.drawText(this.data.shingleColor, {
            x: 150,
            y: 280,
            size: 11,
            font: helvetica,
            color: rgb(0, 0, 0),
          });
        }
        
        // Total Cost (Bottom)
        const totalCostText = `$${this.data.totalPrice.toLocaleString('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`;
        
        page2.drawText(totalCostText, {
          x: 450,
          y: 130,
          size: 12,
          font: helveticaBold,
          color: rgb(0, 0, 0),
        });
        
        // Checkbox Logic
        if (this.data.dealType === 'cash') {
          // Draw 'X' at Retail Section
          page2.drawText('X', {
            x: 40,
            y: 100,
            size: 14,
            font: helveticaBold,
            color: rgb(0, 0, 0),
          });
        } else if (this.data.dealType === 'financed') {
          // Draw 'X' at Finance Section
          page2.drawText('X', {
            x: 40,
            y: 80,
            size: 14,
            font: helveticaBold,
            color: rgb(0, 0, 0),
          });
        }
      }
      
      // PAGE 4: Signature and Date
      if (pages.length >= 4) {
        const page4 = pages[3]; // 0-indexed
        
        // Embed signature if provided
        if (this.data.customerSignature) {
          await this.embedSignature(pdfDoc, page4, 100, 150, 1.0);
        }
        
        // Date
        if (this.data.signatureDate) {
          page4.drawText(this.data.signatureDate.toLocaleDateString(), {
            x: 100,
            y: 110,
            size: 10,
            font: helvetica,
            color: rgb(0, 0, 0),
          });
        }
      }
      
      // Save and return
      const pdfBytes = await pdfDoc.save();
      return Buffer.from(pdfBytes);
      
    } catch (error) {
      console.error('Error filling Scope template:', error);
      throw new Error(`Scope template filling failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Embed signature image at specified coordinates
   */
  private async embedSignature(
    pdfDoc: PDFDocument,
    page: any,
    x: number,
    y: number,
    scale: number = 1.0
  ): Promise<void> {
    try {
      if (!this.data.customerSignature) return;
      
      // Convert base64 data URL to buffer
      const base64Data = this.data.customerSignature.replace(/^data:image\/\w+;base64,/, '');
      const imageBuffer = Buffer.from(base64Data, 'base64');
      
      // Embed image (try PNG first, fallback to JPG)
      let image;
      try {
        image = await pdfDoc.embedPng(imageBuffer);
      } catch {
        try {
          image = await pdfDoc.embedJpg(imageBuffer);
        } catch (error) {
          console.error('Failed to embed signature image:', error);
          return;
        }
      }
      
      // Calculate dimensions with scale
      const maxWidth = 200 * scale;
      const maxHeight = 60 * scale;
      const aspectRatio = image.width / image.height;
      
      let width = maxWidth;
      let height = maxWidth / aspectRatio;
      
      if (height > maxHeight) {
        height = maxHeight;
        width = maxHeight * aspectRatio;
      }
      
      // Draw signature
      page.drawImage(image, {
        x: x,
        y: y,
        width: width,
        height: height,
      });
      
    } catch (error) {
      console.error('Error embedding signature:', error);
    }
  }

  /**
   * Fetch template PDF from URL
   */
  private async fetchTemplate(url: string): Promise<Uint8Array> {
    try {
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch template: ${response.statusText}`);
      }
      
      const arrayBuffer = await response.arrayBuffer();
      return new Uint8Array(arrayBuffer);
      
    } catch (error) {
      console.error('Error fetching template:', error);
      
      // Fallback: Create a simple blank PDF
      console.warn('Template not found, creating blank PDF as fallback');
      return await this.createFallbackPDF();
    }
  }

  /**
   * Create a simple fallback PDF if template is not available
   */
  private async createFallbackPDF(): Promise<Uint8Array> {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([612, 792]); // Letter size
    
    const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    
    page.drawText('PROPOSAL DOCUMENT', {
      x: 50,
      y: 750,
      size: 24,
      font: helveticaBold,
      color: rgb(0, 0, 0),
    });
    
    page.drawText('(Template not configured - using fallback)', {
      x: 50,
      y: 720,
      size: 10,
      color: rgb(0.5, 0.5, 0.5),
    });
    
    page.drawText(`Customer: ${this.data.customerName}`, {
      x: 50,
      y: 680,
      size: 12,
      color: rgb(0, 0, 0),
    });
    
    page.drawText(`Address: ${this.data.propertyAddress}`, {
      x: 50,
      y: 660,
      size: 12,
      color: rgb(0, 0, 0),
    });
    
    page.drawText(`Total: $${this.data.totalPrice.toFixed(2)}`, {
      x: 50,
      y: 640,
      size: 12,
      color: rgb(0, 0, 0),
    });
    
    const pdfBytes = await pdfDoc.save();
    return pdfBytes;
  }
}

/**
 * Main export function
 */
export async function generateProposalPDF(data: ProposalData): Promise<Buffer> {
  const filler = new PDFFormFiller(data);
  return filler.generate();
}

/**
 * Test PDF Generator - Creates test documents with dummy data
 * Useful for calibrating coordinates
 */
export async function generateTestPDF(dealType: 'insurance' | 'cash' | 'financed'): Promise<Buffer> {
  const testData: ProposalData = {
    customerName: 'John Test Customer',
    customerEmail: 'john@test.com',
    customerPhone: '(555) 123-4567',
    propertyAddress: '123 Test Street',
    cityStateZip: 'Test City, TX 75001',
    totalPrice: 15000,
    pricePerSq: 500,
    roofSquares: 30,
    dealType: dealType,
    insuranceCarrier: 'Test Insurance Co',
    policyNumber: 'POL-12345',
    claimNumber: 'CLM-67890',
    deductible: 1500,
    shingleColor: 'Charcoal Gray',
    proposalDate: new Date(),
    signatureDate: new Date(),
    // Note: No signature for test - easier to see text placement
  };
  
  const filler = new PDFFormFiller(testData);
  return filler.generate();
}
