# Vanguard Systems (VIS) Rebranding Summary

## Overview
Complete rebranding from Nextdoor Exteriors to **Vanguard Systems (VIS)** with new logo and color scheme.

## Brand Identity

### Company Name
- **Old**: Nextdoor Exteriors / NDES
- **New**: Vanguard Systems (VIS)

### Color Palette
Based on the shield logo with electric cyan and navy blue:

- **Primary Cyan**: `#00D4FF` (Electric Cyan - main accent)
- **Navy Blue**: `#001F3F` (Deep Navy - primary background)
- **Dark Blue**: `#003366` (Secondary accent)
- **Silver**: `#C0C0C0` (Metallic from shield)
- **Slate**: `#1e293b` (UI background)

### Old Colors Replaced
- `#00d4aa` (teal) → `#00D4FF` (cyan)
- `#00b894` (hover teal) → `#00B8E6` (darker cyan)

## Changes Made

### Core Files Updated
1. **`package.json`**: Renamed from `nextdoor-landing` to `vanguard-crm`
2. **`client/src/lib/constants.ts`**: Updated brand constants and logo URL
3. **`client/src/index.css`**: Updated design philosophy comments

### Color Updates
- **263 color references** updated across **52 client-side files**
- All UI components now use Vanguard cyan (`#00D4FF`)
- All hover states updated to darker cyan (`#00B8E6`)

### Server-Side Updates
1. **`server/lib/pdfGenerator.ts`**: Updated PDF color scheme
2. **`server/lib/README_PDF_GENERATOR.md`**: Updated documentation

### Files Modified
- Settings pages (Company, Profile, General)
- CRM pages (Dashboard, Leads, Calendar, Team, Pipeline, Reports)
- Job detail components (Photos, Documents, Messages, Proposal, Production)
- Proposal and material order components
- All shared UI components

## Logo
New logo URL configured in constants:
```
https://mkmdffzjkttsklzsrdbv.supabase.co/storage/v1/object/public/Proposal_Bucket/vanguard-logo.png
```

**Note**: Upload your shield logo to this location or update the URL in `client/src/lib/constants.ts`

## Design Philosophy
"Security & Innovation" - Dark mode base matching the shield logo with electric cyan accents and navy blue foundation for a professional, tech-forward appearance.

## Next Steps
1. Upload the Vanguard Systems logo to the configured URL
2. Test the application to verify all branding appears correctly
3. Update any remaining company-specific content (emails, PDFs, etc.)
