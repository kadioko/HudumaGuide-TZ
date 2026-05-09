# HudumaGuide TZ Product Strategy

## Positioning

HudumaGuide TZ is an independent citizen-assistance and business-registration guide for Tanzania. It helps people understand requirements, prepare documents, follow steps, save checklists, and set reminders while redirecting them to official portals or offices for final action.

The app must never imply that it is a government platform or that it can submit official applications without real integrations.

Core trust statement:

> This is an independent guide. It is not an official government platform. Always confirm final requirements, fees, and procedures through official government channels.

## MVP Thesis

The fastest useful version should reduce confusion around common services and business setup. Users should be able to search for a service, understand the steps, save what they need, and remember deadlines. Entrepreneurs should receive a simple roadmap based on their situation.

## First MVP Feature List

1. Government service search
   - Swahili and English keyword matching
   - Category filters
   - Common keyword support such as NIDA, TIN, TRA, BRELA, leseni, kodi, passport, cheti

2. Step-by-step service guides
   - Summary, who needs it, required documents, steps, timeline, cost warning, common mistakes, FAQs, official link placeholder
   - Readiness score based on completed checklist items
   - Report outdated information action

3. Save checklist
   - Save guide
   - Mark required documents and steps as done
   - Persist locally for low-data/offline use

4. BiasharaStart business setup wizard
   - Form-based wizard for business type, structure, NIDA, TIN, address, licence, EFD/VFD, employees, tax reminders
   - Personalized roadmap
   - Saved business plans
   - Suggested compliance reminders for records, tax checks, and licence checks
   - Cost-planning buckets without invented official fees

5. Reminders
   - Create custom reminders
   - Categories for tax, licence, documents, service follow-up, passport, driving licence, and compliance
   - Link reminders to service/business/document later

6. Document vault metadata
   - Add local document records
   - Organize by folder
   - Track expiry and reminder dates
   - Store notes and file references
   - Defer private file upload until Supabase Auth, Storage, and RLS are fully configured

## Experience Principles

- Swahili-first, English-supported
- Plain language, no overclaiming
- Low-data, fast, and readable
- Mobile-first layouts with large tap targets
- Civic-tech trust: clean white UI, green/blue/gold accents, visible disclaimers
- Useful without login for public guides; login required later for cloud document storage

## MVP Non-Goals

- No official application submission
- No exact unofficial fee claims
- No legal/tax advice beyond general guidance
- No paid APIs
- No aggressive monetization
- Private document file upload is prepared but not enabled in the local-first slice

## Success Signals

- Users can find a guide in under 30 seconds
- Users save checklists and return to them
- Entrepreneurs complete the wizard and understand next steps
- Reminder creation is simple enough for non-technical users
- Outdated information reports are easy to submit
