# 🧪 Complete Field Test Guide

## Overview
This guide walks through the entire job lifecycle from lead creation to material ordering, testing all major features and workflows.

---

## 📋 Pre-Test Checklist

### **Required Setup:**
- [ ] Database migrations run (`fix_rls_permissions.sql`, `add_proposal_pricing.sql`)
- [ ] Server running (`npm run dev`)
- [ ] Client running (`npm run dev`)
- [ ] Supabase connected
- [ ] Test user accounts created:
  - [ ] Sales Rep account
  - [ ] Owner/Admin account
  - [ ] Team Lead account (optional)

### **Optional (for full PDF features):**
- [ ] PDFKit installed (`npm install pdfkit @types/pdfkit`)
- [ ] PDF generation code uncommented in `server/routers.ts`
- [ ] Supabase storage bucket configured

---

## 🎯 Test Scenario

**Customer:** John Smith  
**Property:** 123 Oak Street, Dallas, TX 75001  
**Phone:** (555) 123-4567  
**Email:** john.smith@email.com  
**Deal Type:** Insurance  
**Insurance Carrier:** State Farm  
**Claim Number:** CLM-98765  
**Roof Size:** 30 squares (3,000 sq ft)  
**Price Per Square:** $500  
**Total Price:** $15,000  

---

## 🔬 Test 1: Create Lead & Auto-Assign

### **Objective:** Verify sales reps can create jobs and they're auto-assigned

### **Steps:**

1. **Login as Sales Rep**
   ```
   Navigate to: /login
   Enter credentials
   Click "Sign In"
   ```
   
   ✅ **Expected:** Dashboard loads, shows user name in header

2. **Navigate to Leads Page**
   ```
   Click "Leads" in sidebar
   ```
   
   ✅ **Expected:** Leads list page loads

3. **Create New Job**
   ```
   Click "+ New Job" button
   Fill in form:
     - Full Name: John Smith
     - Email: john.smith@email.com
     - Phone: (555) 123-4567
     - Address: 123 Oak Street
     - City, State, ZIP: Dallas, TX 75001
     - Deal Type: Insurance
     - Status: Lead
   Click "Create Job"
   ```
   
   ✅ **Expected:** 
   - Success toast appears
   - Job appears in list immediately
   - Job shows in "My Jobs" filter
   - Job is assigned to current user (check assignedTo field)

4. **Verify Auto-Assignment**
   ```
   Click on newly created job
   Check "Assigned To" field in Overview tab
   ```
   
   ✅ **Expected:** Shows current sales rep's name

5. **Verify RLS Permissions**
   ```
   Logout
   Login as different Sales Rep
   Navigate to Leads
   ```
   
   ✅ **Expected:** First rep's job NOT visible (unless shared via team lead)

### **Test Results:**
- [ ] Job created successfully
- [ ] Auto-assigned to creator
- [ ] Visible in creator's job list
- [ ] Not visible to other reps
- [ ] Activity logged

---

## 🔬 Test 2: Status Change & Data Validation

### **Objective:** Verify phone/email requirement when advancing pipeline

### **Steps:**

1. **Create Job Without Contact Info**
   ```
   Create new job:
     - Full Name: Jane Doe
     - Email: (leave blank)
     - Phone: (leave blank)
     - Address: 456 Pine Ave
     - Status: Lead
   Click "Create Job"
   ```
   
   ✅ **Expected:** Job created (allowed for 'lead' status)

2. **Try to Advance Status Without Data**
   ```
   Open Jane Doe job
   Click status dropdown
   Select "Prospect"
   ```
   
   ❌ **Expected:** 
   - Error toast: "Phone and Email required to advance from Lead status"
   - Status remains "Lead"
   - Job not updated

3. **Add Contact Info**
   ```
   Click "Edit Job" button
   Add:
     - Email: jane.doe@email.com
     - Phone: (555) 987-6543
   Click "Save"
   ```
   
   ✅ **Expected:** Job updated successfully

4. **Advance Status**
   ```
   Click status dropdown
   Select "Prospect"
   ```
   
   ✅ **Expected:** 
   - Status changes to "Prospect"
   - Success toast appears
   - Activity logged
   - Proposal tab now visible

5. **Test Allowed Statuses**
   ```
   Create another job without contact info
   Try changing status to "Appointment Set"
   ```
   
   ✅ **Expected:** Allowed (appointment_set is exempt from validation)

### **Test Results:**
- [ ] Lead status allows missing contact info
- [ ] Advancing to Prospect requires phone + email
- [ ] Error message clear and helpful
- [ ] Appointment Set status exempt from validation
- [ ] Edit flow works correctly

---

## 🔬 Test 3: Measure Roof (Manual & Satellite)

### **Objective:** Test both manual entry and satellite measurement

### **Test 3A: Manual Measurement**

1. **Open Job**
   ```
   Open John Smith job
   Navigate to Production Report tab
   ```

2. **Enter Manual Roof Area**
   ```
   Scroll to "Manual Roof Area" section
   Enter: 3000 (sq ft)
   Click "Save Manual Area"
   ```
   
   ✅ **Expected:** 
   - Success toast
   - Area saved
   - Shows "30.0 squares" calculation

3. **Verify in Proposal Tab**
   ```
   Navigate to Proposal tab
   Check "Roof Size" field
   ```
   
   ✅ **Expected:** Shows "30.0 squares"

### **Test 3B: Satellite Measurement (if Google Solar API configured)**

1. **Trigger Solar API**
   ```
   In Production Report tab
   Click "Get Solar Data" or similar button
   Wait for API response
   ```
   
   ✅ **Expected:** 
   - Loading indicator
   - Solar data populates
   - Roof area calculated from API
   - Shows on 3D roof visualization

2. **Verify Roof Area**
   ```
   Check solarApiData.roofArea field
   Should show area in sq ft
   ```
   
   ✅ **Expected:** Roof area from satellite data

3. **Proposal Tab Priority**
   ```
   Navigate to Proposal tab
   ```
   
   ✅ **Expected:** Uses solarApiData.roofArea if available, falls back to manualAreaSqFt

### **Test Results:**
- [ ] Manual area entry works
- [ ] Manual area saves to database
- [ ] Calculation to squares correct (÷ 100)
- [ ] Satellite data retrieval works (if configured)
- [ ] Proposal tab reads correct source
- [ ] Fallback logic works

---

## 🔬 Test 4: Proposal Calculator & Negotiation Flow

### **Objective:** Test complete pricing workflow including negotiation

### **Test 4A: Green Zone (Healthy Margin)**

1. **Navigate to Proposal Tab**
   ```
   Open John Smith job (30 squares)
   Click "Proposal" tab
   ```
   
   ✅ **Expected:** 
   - Tab visible (job status must be "prospect" or higher)
   - Shows roof size: 30.0 squares
   - Price input field ready

2. **Enter Green Zone Price**
   ```
   Enter Price Per Square: 500
   ```
   
   ✅ **Expected:** 
   - Total calculates automatically: $15,000
   - Green zone indicator appears
   - Message: "Healthy Margin"
   - "Save & Generate Contract" button enabled

3. **Save Pricing**
   ```
   Click "Save & Generate Contract"
   ```
   
   ✅ **Expected:** 
   - Success toast
   - Status changes to "approved"
   - Signature pad opens (if implemented)
   - Activity logged

### **Test 4B: Yellow Zone (Low Margin - Rep View)**

1. **Create New Job**
   ```
   Create job with 25 squares
   Advance to "Prospect" status
   Navigate to Proposal tab
   ```

2. **Enter Yellow Zone Price**
   ```
   Enter Price Per Square: 475
   ```
   
   ✅ **Expected:** 
   - Total: $11,875
   - Yellow zone indicator
   - Message: "Low Margin - Requires Approval"
   - "Submit for Owner Approval" button shown
   - "Generate Contract" button DISABLED

3. **Submit for Approval**
   ```
   Click "Submit for Owner Approval"
   ```
   
   ✅ **Expected:** 
   - Success toast
   - Status changes to "pending_approval"
   - UI shows "Awaiting Owner Approval"
   - Rep cannot edit price

### **Test 4C: Yellow Zone (Owner Approval)**

1. **Login as Owner**
   ```
   Logout
   Login with Owner/Admin account
   Navigate to job in pending_approval status
   Open Proposal tab
   ```
   
   ✅ **Expected:** 
   - Shows pending approval UI
   - Shows rep's requested price: $475/sq
   - Shows total: $11,875
   - Two options:
     - "Approve" button
     - "Deny & Counter" button

2. **Test Owner Override (Approve)**
   ```
   Click "Approve" button
   ```
   
   ✅ **Expected:** 
   - Success toast
   - Status changes to "approved"
   - "Generate Contract" button enabled
   - Activity logged

3. **Test Deny & Counter**
   ```
   (Use different job in pending_approval)
   Click "Deny & Counter"
   Enter counter price: 490
   Click "Submit Counter Offer"
   ```
   
   ✅ **Expected:** 
   - Success toast
   - Status changes to "negotiation"
   - Counter price saved
   - Activity logged

### **Test 4D: Negotiation Flow (Rep Response)**

1. **Login as Sales Rep**
   ```
   Logout
   Login as original sales rep
   Open job in "negotiation" status
   Navigate to Proposal tab
   ```
   
   ✅ **Expected:** 
   - Shows negotiation UI
   - Shows owner's counter: $490/sq
   - Shows new total: $12,250
   - Two options:
     - "Accept Counter Offer"
     - "Deny Counter Offer"

2. **Accept Counter**
   ```
   Click "Accept Counter Offer"
   ```
   
   ✅ **Expected:** 
   - Success toast
   - Status changes to "approved"
   - Price updated to counter price
   - "Generate Contract" button enabled

3. **Deny Counter (Alternative Path)**
   ```
   (Use different negotiation job)
   Click "Deny Counter Offer"
   ```
   
   ✅ **Expected:** 
   - Status reverts to "draft" or similar
   - Rep can enter new price
   - Negotiation cycle can restart

### **Test 4E: Red Zone (Below Minimum)**

1. **Enter Red Zone Price**
   ```
   Enter Price Per Square: 425
   ```
   
   ✅ **Expected:** 
   - Total: $10,625
   - Red zone indicator
   - Message: "Below Minimum - Cannot Proceed"
   - All action buttons DISABLED
   - Cannot submit or generate

### **Test Results:**
- [ ] Green zone (≥$500) allows immediate contract generation
- [ ] Yellow zone ($450-$499) requires owner approval
- [ ] Red zone (<$450) blocks all actions
- [ ] Owner can approve or counter
- [ ] Rep can accept or deny counter
- [ ] All status transitions work
- [ ] Activity logged at each step
- [ ] Calculations accurate

---

## 🔬 Test 5: Contract Generation & Signature

### **Objective:** Test PDF generation and signature capture

### **Test 5A: Generate Contract (No Signature)**

1. **Open Approved Proposal**
   ```
   Open job with approved pricing
   Navigate to Proposal tab
   ```
   
   ✅ **Expected:** 
   - Shows "Approved" state
   - Shows final price
   - "Generate Contract" button visible

2. **Click Generate Contract**
   ```
   Click "Generate Contract" button
   ```
   
   ✅ **Expected:** 
   - Loading state
   - Success toast (if pdfkit not installed: "PDF generation feature ready")
   - If pdfkit installed: Signature pad opens

### **Test 5B: Signature Capture (if pdfkit installed)**

1. **Review PDF Preview**
   ```
   Signature pad dialog opens
   Left side shows PDF preview
   ```
   
   ✅ **Expected:** 
   - PDF preview loads in iframe
   - Shows correct document type:
     - Insurance: "Contingency Agreement & LOA"
     - Cash: "Roofing Proposal - Cash Payment"
     - Financed: "Roofing Proposal - Financing"
   - Customer name displayed
   - Download button available

2. **Download Preview**
   ```
   Click "Download" button
   ```
   
   ✅ **Expected:** 
   - PDF downloads
   - Opens in browser/PDF viewer
   - Contains all job details
   - No signature yet (preview only)

3. **Sign on Canvas**
   ```
   Right side: Signature canvas
   Draw signature with mouse/finger
   ```
   
   ✅ **Expected:** 
   - Smooth drawing
   - Black ink, 2px width
   - Signature line visible
   - Instructions clear

4. **Test Clear Button**
   ```
   Click "Clear" button
   ```
   
   ✅ **Expected:** 
   - Canvas clears
   - Can draw again
   - "Accept & Sign" button disabled until new signature

5. **Complete Signature**
   ```
   Draw signature again
   Click "Accept & Sign"
   ```
   
   ✅ **Expected:** 
   - Loading state
   - Success toast: "Signed proposal saved to Documents!"
   - Dialog closes
   - Activity logged

6. **Verify Document Saved**
   ```
   Navigate to Documents tab
   ```
   
   ✅ **Expected:** 
   - New document appears
   - Filename: "proposal-signed-{jobId}-{timestamp}.pdf"
   - Type: application/pdf
   - Uploaded by: current user
   - Timestamp: current time

7. **Download Signed PDF**
   ```
   Click download icon on document
   Open PDF
   ```
   
   ✅ **Expected:** 
   - PDF downloads
   - Contains all proposal details
   - Signature embedded on signature line
   - Date shown next to signature
   - Professional appearance

### **Test 5C: Different Deal Types**

1. **Test Insurance Deal**
   ```
   Job with dealType: "insurance"
   Generate contract
   ```
   
   ✅ **Expected:** 
   - 2-page document
   - Page 1: Contingency Agreement
   - Page 2: Letter of Authorization
   - Insurance carrier and claim number shown
   - Contingency terms included

2. **Test Cash Deal**
   ```
   Job with dealType: "cash"
   Generate contract
   ```
   
   ✅ **Expected:** 
   - 2-page document
   - Standard bid format
   - Payment terms:
     - 10% deposit
     - 40% on material delivery
     - 50% on completion

3. **Test Financed Deal**
   ```
   Job with dealType: "financed"
   Generate contract
   ```
   
   ✅ **Expected:** 
   - 2-page document
   - Standard bid format
   - Financing terms:
     - 0% APR options
     - 12-120 month terms
     - No prepayment penalties

### **Test Results:**
- [ ] Generate button works
- [ ] Signature pad opens
- [ ] PDF preview displays
- [ ] Canvas drawing smooth
- [ ] Clear button works
- [ ] Signature captures correctly
- [ ] PDF saves to Documents
- [ ] Signature embedded in PDF
- [ ] Date shown correctly
- [ ] All deal types render correctly
- [ ] Activity logged

---

## 🔬 Test 6: Material Order

### **Objective:** Test material order email generation

### **Test 6A: Open Material Order Dialog**

1. **Navigate to Job Detail**
   ```
   Open job (must be Owner/Office role)
   ```
   
   ✅ **Expected:** 
   - "Material Order" button visible in header
   - Next to "Edit Job" button

2. **Click Material Order**
   ```
   Click "Material Order" button
   ```
   
   ✅ **Expected:** 
   - Dialog opens
   - Two-column layout:
     - Left: Accessory inputs
     - Right: Email preview

### **Test 6B: Enter Accessories**

1. **Fill Accessory Fields**
   ```
   Enter:
     - Drip Edge: 20 pieces
     - Pipe Boots: 8 pieces
     - Paint: 2 gallons
     - Goose Necks: 4 pieces
   ```
   
   ✅ **Expected:** 
   - Values update in real-time
   - Email preview updates automatically

2. **Verify Beacon Calculations**
   ```
   Check email preview (right side)
   ```
   
   ✅ **Expected:** 
   - Shingles calculated (roof squares × 3)
   - Starter calculated (perimeter ÷ 3)
   - Hip & Ridge calculated (ridge length ÷ 3)
   - Underlayment calculated (roof squares ÷ 10)
   - Nails calculated (roof squares × 2)
   - Accessories shown as entered

3. **Verify Email Format**
   ```
   Check email preview content
   ```
   
   ✅ **Expected:** 
   - Subject: "Material Order - [Customer Name] - [Address]"
   - Body includes:
     - Customer name
     - Property address
     - Itemized material list
     - Quantities
     - Professional formatting

### **Test 6C: Send Email**

1. **Click Send Button**
   ```
   Click "Send" button
   ```
   
   ✅ **Expected:** 
   - Default email client opens
   - Email pre-filled with:
     - To: (supplier email or blank)
     - Subject: Material order details
     - Body: Complete material list
   - User can add recipient and send

2. **Test Copy to Clipboard**
   ```
   (Alternative) Click "Copy" button if available
   ```
   
   ✅ **Expected:** 
   - Material list copied to clipboard
   - Success toast
   - Can paste into email/text

### **Test Results:**
- [ ] Dialog opens for Owner/Office only
- [ ] Accessory inputs work
- [ ] Beacon calculations correct
- [ ] Email preview updates live
- [ ] Email format professional
- [ ] Send button opens email client
- [ ] All data pre-filled correctly

---

## 📊 Complete Test Summary

### **Test Completion Checklist:**

#### **1. Create Lead & Auto-Assign**
- [ ] Job created successfully
- [ ] Auto-assigned to creator
- [ ] RLS permissions work
- [ ] Activity logged

#### **2. Status Change & Validation**
- [ ] Lead status allows missing data
- [ ] Prospect requires phone + email
- [ ] Error messages clear
- [ ] Validation works correctly

#### **3. Measure Roof**
- [ ] Manual entry works
- [ ] Satellite data works (if configured)
- [ ] Calculations correct
- [ ] Proposal tab reads data

#### **4. Proposal Calculator**
- [ ] Green zone allows immediate approval
- [ ] Yellow zone requires owner approval
- [ ] Red zone blocks actions
- [ ] Negotiation flow works
- [ ] All status transitions correct
- [ ] Activity logged

#### **5. Contract & Signature**
- [ ] PDF generates correctly
- [ ] Signature pad opens
- [ ] Canvas drawing works
- [ ] Signature embeds in PDF
- [ ] Document saves to tab
- [ ] All deal types work

#### **6. Material Order**
- [ ] Dialog opens
- [ ] Calculations correct
- [ ] Email preview accurate
- [ ] Send button works

---

## 🐛 Known Issues & Workarounds

### **Issue 1: PDFKit Not Installed**
**Symptom:** "PDF generation feature ready" message instead of actual PDF  
**Workaround:** Install pdfkit: `npm install pdfkit @types/pdfkit`  
**Fix:** Uncomment PDF generation code in `server/routers.ts`

### **Issue 2: Signature Pad Not Opening**
**Symptom:** Button click does nothing  
**Check:** 
- Proposal status must be "approved"
- User must have permission to view job
- Check browser console for errors

### **Issue 3: Documents Not Appearing**
**Symptom:** Signed PDF not in Documents tab  
**Check:** 
- Supabase storage bucket configured
- RLS policies set correctly
- Check server logs for upload errors

### **Issue 4: Material Order Button Not Visible**
**Symptom:** Can't find Material Order button  
**Check:** 
- User role must be OWNER or OFFICE
- Button is in job detail header, next to "Edit Job"

---

## 📈 Performance Benchmarks

### **Expected Response Times:**

| Action | Expected Time | Acceptable Time |
|--------|---------------|-----------------|
| Create Job | < 500ms | < 1s |
| Load Job Detail | < 1s | < 2s |
| Update Proposal | < 500ms | < 1s |
| Generate PDF Preview | < 2s | < 5s |
| Capture Signature | < 500ms | < 1s |
| Save Signed PDF | < 3s | < 10s |
| Load Documents Tab | < 1s | < 2s |

---

## 🎯 Success Criteria

### **All Tests Pass:**
- ✅ All 6 test sections complete
- ✅ No critical errors
- ✅ All features functional
- ✅ Data persists correctly
- ✅ Activity logging works
- ✅ Permissions enforced

### **Ready for Production:**
- ✅ PDFKit installed and working
- ✅ Supabase storage configured
- ✅ All migrations run
- ✅ RLS policies active
- ✅ Error handling robust
- ✅ User feedback clear

---

## 📞 Support & Troubleshooting

### **Common Issues:**

**Q: Job not appearing in list?**  
A: Check RLS permissions, ensure user is assigned or on team

**Q: Can't advance status?**  
A: Verify phone and email are filled in

**Q: Proposal tab not visible?**  
A: Job status must be "prospect" or higher

**Q: PDF not generating?**  
A: Install pdfkit and uncomment server code

**Q: Signature not embedding?**  
A: Check base64 format, verify PDFKit image support

**Q: Material order calculations wrong?**  
A: Verify roof area data, check Beacon formulas

---

## 🚀 Next Steps After Testing

1. **Document Issues:** Log any bugs found during testing
2. **Performance Tuning:** Optimize slow queries/operations
3. **User Training:** Create training materials based on test flow
4. **Production Deploy:** Deploy to production environment
5. **Monitor:** Watch for errors in production logs
6. **Iterate:** Gather user feedback and improve

---

**Test Date:** _____________  
**Tester Name:** _____________  
**Environment:** ☐ Development ☐ Staging ☐ Production  
**Overall Result:** ☐ Pass ☐ Pass with Issues ☐ Fail  

**Notes:**
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________
