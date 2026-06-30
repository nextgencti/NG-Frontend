import logoImg from '../assets/logo.png';
import paidStampImg from '../assets/paid stamp.png';

/**
 * Formats a value into segmented digit boxes for the printable form.
 */
const getDigitBoxesHTML = (val, length = 8, isDate = false) => {
  let digits = '';
  if (val) {
    // Strip non-digits
    digits = val.toString().replace(/\D/g, '');
    
    // If it's a date in YYYY-MM-DD format (standard HTML date input), convert to DDMMYYYY
    if (isDate && val.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const [year, month, day] = val.split('-');
      digits = day + month + year;
    }
  }
  
  let html = '';
  for (let i = 0; i < length; i++) {
    const d = digits[i] !== undefined ? digits[i] : '';
    html += `<div class="digit-box">${d}</div>`;
  }
  return html;
};

/**
 * Converts a number to words (English representation).
 */
const numberToWords = (num) => {
  if (num === 0 || !num) return 'Zero';
  
  const a = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  const g = ['', 'Thousand', 'Million', 'Billion', 'Trillion'];
  
  const convertHundreds = (n) => {
    let word = '';
    if (n >= 100) {
      word += a[Math.floor(n / 100)] + ' Hundred ';
      n %= 100;
    }
    if (n >= 20) {
      word += b[Math.floor(n / 10)] + ' ';
      n %= 10;
    }
    if (n > 0) {
      word += a[n] + ' ';
    }
    return word.trim();
  };

  let n = parseInt(num);
  if (isNaN(n)) return 'Zero';
  
  let words = '';
  let groupIdx = 0;
  
  while (n > 0) {
    const chunk = n % 1000;
    if (chunk > 0) {
      const chunkWords = convertHundreds(chunk);
      words = chunkWords + (g[groupIdx] ? ' ' + g[groupIdx] : '') + ' ' + words;
    }
    n = Math.floor(n / 1000);
    groupIdx++;
  }
  
  return words.trim();
};

/**
 * Prints the student's admission form using a new window context
 * to prevent parent styles from interfering and guarantee crisp A4 page rendering.
 */
export const printAdmissionForm = (studentData, courseName = '') => {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Please allow popups to print the admission form.');
    return;
  }

  // Fallback calculations for values
  const finalName = studentData.fullName || studentData.name || '';
  const finalCourse = courseName || studentData.courseName || studentData.courseId || '';
  const finalDOB = studentData.dob || '';
  const finalPhone = studentData.phone || '';
  const finalAadhaar = studentData.aadhaar || '';
  const finalAdmissionDate = studentData.admissionDate || '';
  
  const finalReceiptNumber = studentData.receiptNumber || `REC-${new Date().getFullYear()}-TEMP`;
  const feeSuffix = studentData.feeModel === 'monthly' ? ' / Monthly' : (studentData.feeModel === 'fixed' ? ' (Fixed)' : '');
  const formattedTotalFee = studentData.totalFee ? `Rs. ${studentData.totalFee}${feeSuffix}` : '';
  const formattedFeePaid = studentData.feePaid ? `Rs. ${studentData.feePaid}${studentData.feeModel === 'monthly' ? ' (Installment)' : ''}` : '';

  const totalFeeVal = parseFloat(studentData.totalFee) || 0;
  const feePaidVal = parseFloat(studentData.feePaid) || 0;
  const remainingBalance = Math.max(0, totalFeeVal - feePaidVal);
  const amountInWords = numberToWords(feePaidVal);

  const isMale = studentData.gender?.toLowerCase() === 'male';
  const isFemale = studentData.gender?.toLowerCase() === 'female';
  
  const isCash = studentData.paymentMode?.toLowerCase() === 'cash';
  const isOnline = studentData.paymentMode?.toLowerCase() === 'online';

  const docTitle = `Admission_Form_${finalName.replace(/\s+/g, '_')}`;

  const logoAbsoluteURL = window.location.origin + logoImg;
  const logoHTML = `<img src="${logoAbsoluteURL}" alt="Logo" style="height: 48px; width: auto; object-fit: contain;" />`;
  const paidStampAbsoluteURL = window.location.origin + paidStampImg;

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>${docTitle}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
          
          @page {
            size: A4;
            margin: 20mm 15mm;
          }
          
          body {
            font-family: 'Inter', sans-serif;
            margin: 0;
            padding: 0;
            color: #1e293b;
            background-color: #fff;
            font-size: 13px;
            line-height: 1.5;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          
          .container {
            width: 100%;
            max-width: 800px;
            margin: 0 auto;
            position: relative;
          }

          /* Header styles */
          .header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            border-bottom: 2.5px solid #2563eb;
            padding-bottom: 12px;
            margin-bottom: 20px;
          }
          
          .header-side {
            width: 50px;
            display: flex;
            justify-content: center;
          }

          .header-center {
            flex: 1;
            text-align: center;
          }

          .header-center h1 {
            font-size: 20px;
            font-weight: 800;
            color: #1e3a8a;
            margin: 0 0 4px 0;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }

          .header-center h2 {
            font-size: 15px;
            font-weight: 700;
            color: #2563eb;
            margin: 0;
            text-transform: uppercase;
            letter-spacing: 2px;
          }

          /* Form layout with absolute photo box */
          .form-body {
            position: relative;
            margin-top: 20px;
          }

          .photo-box {
            position: absolute;
            top: 0;
            right: 0;
            width: 100px;
            height: 120px;
            border: 1.5px dashed #94a3b8;
            border-radius: 4px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            font-size: 9px;
            font-weight: 700;
            color: #64748b;
            text-transform: uppercase;
            text-align: center;
            padding: 2px;
            overflow: hidden;
            background-color: #f8fafc;
          }

          .photo-box img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }

          /* Section block styles */
          .section {
            margin-bottom: 22px;
            width: 100%;
          }

          .section-title {
            font-size: 12px;
            font-weight: 700;
            color: #2563eb;
            text-transform: uppercase;
            border-bottom: 1.5px solid #e2e8f0;
            padding-bottom: 4px;
            margin-bottom: 14px;
            letter-spacing: 0.5px;
          }

          /* Fields and inline elements */
          .row {
            display: flex;
            flex-wrap: wrap;
            margin-bottom: 12px;
            align-items: center;
            width: 100%;
          }

          .col {
            display: flex;
            align-items: center;
            margin-right: 15px;
          }

          .col-fill {
            flex: 1;
            display: flex;
            align-items: center;
          }

          .label {
            font-weight: 600;
            color: #1e293b;
            margin-right: 8px;
            white-space: nowrap;
          }

          .value-line {
            flex: 1;
            border-bottom: 1px solid #94a3b8;
            min-height: 18px;
            padding-bottom: 2px;
            font-weight: 500;
            font-size: 13.5px;
            color: #0f172a;
          }

          /* Grid box systems */
          .digit-box-container {
            display: flex;
            align-items: center;
            margin-left: 5px;
          }

          .digit-box {
            width: 22px;
            height: 22px;
            border: 1px solid #475569;
            border-right: none;
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: monospace;
            font-size: 13px;
            font-weight: 700;
            color: #0f172a;
          }

          .digit-box:last-child {
            border-right: 1px solid #475569;
          }

          /* Custom checkboxes */
          .checkbox-item {
            display: flex;
            align-items: center;
            margin-right: 20px;
          }

          .check-square {
            width: 15px;
            height: 15px;
            border: 1.5px solid #475569;
            border-radius: 2px;
            margin-right: 6px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 10px;
            font-weight: 900;
          }

          /* Declaration block */
          .declaration-text {
            font-size: 11px;
            color: #475569;
            text-align: justify;
            margin-bottom: 35px;
            line-height: 1.6;
          }

          /* Signatures block */
          .signatures-row {
            display: flex;
            justify-content: space-between;
            margin-top: 50px;
            margin-bottom: 25px;
            padding: 0 10px;
          }

          .signature-col {
            text-align: center;
            width: 200px;
          }

          .signature-line {
            border-top: 1.5px solid #94a3b8;
            margin-bottom: 6px;
          }

          .signature-label {
            font-size: 11px;
            font-weight: 600;
            color: #475569;
            text-transform: uppercase;
          }

          /* Office Box */
          .office-box {
            border: 1.5px solid #2563eb;
            border-radius: 6px;
            padding: 12px 16px;
            margin-top: 25px;
            background-color: #f8fafc;
          }

          .office-box-title {
            font-size: 11px;
            font-weight: 700;
            color: #1e3a8a;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 8px;
          }

          /* Helper styles for layouts */
          .w-70 { width: 70%; }
          .w-65 { width: 65%; }
          .w-35 { width: 35%; }
          .w-30 { width: 30%; }
          .w-50 { width: 50%; }
          .w-100 { width: 100%; }
          
          @media print {
            .page-break {
              clear: both;
              page-break-before: always;
              break-before: page;
            }
          }
          
          .receipt-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 15px;
          }
          
          .receipt-table th, .receipt-table td {
            border: 1px solid #cbd5e1;
            padding: 8px 10px;
            font-size: 12.5px;
          }
          
          /* Receipt Card Layout styles (Page 2) */
          .receipt-card {
            background-color: #fff;
            border: 1.5px solid #e2e8f0;
            border-radius: 24px;
            padding: 24px;
            position: relative;
            border-top: 8px solid #1e3a8a;
            margin-top: 10px;
            box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
          }
          .receipt-watermark {
            position: absolute;
            inset: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            pointer-events: none;
            opacity: 0.11;
            z-index: 1;
            overflow: hidden;
          }
          .receipt-watermark img {
            width: 280px;
            height: 280px;
            object-fit: contain;
            transform: rotate(-15deg);
          }
          .paid-stamp-overlay {
            position: absolute;
            right: 32px;
            top: 48px;
            display: flex;
            align-items: center;
            border: 1.5px solid #10b981;
            color: #059669;
            background-color: rgba(209, 250, 229, 0.5);
            border-radius: 8px;
            padding: 4px 12px;
            font-size: 10px;
            font-weight: 900;
            letter-spacing: 1px;
            transform: rotate(-12deg);
            z-index: 10;
          }
          .receipt-logo-circle {
            width: 48px;
            height: 48px;
            background-color: #fff;
            border: 1px solid #f1f5f9;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 2px;
            box-shadow: 0 1px 2px rgba(0,0,0,0.05);
            margin-right: 12px;
            flex-shrink: 0;
          }
          .receipt-header-title {
            font-size: 14px;
            font-weight: 900;
            color: #1e1b4b;
            text-transform: uppercase;
            margin: 0;
            font-family: 'Inter', sans-serif;
          }
          .receipt-header-tagline {
            font-size: 8px;
            font-weight: 700;
            color: #94a3b8;
            text-transform: uppercase;
            letter-spacing: 1.5px;
            margin: 2px 0 0 0;
          }
          .receipt-header-contacts {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
            margin-top: 6px;
            font-size: 8.5px;
            color: #64748b;
            font-weight: 650;
          }
          .receipt-meta-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 16px;
            border-bottom: 1px solid #f1f5f9;
            padding-bottom: 10px;
            margin-top: 15px;
            margin-bottom: 15px;
          }
          .receipt-meta-label {
            font-size: 7.5px;
            font-weight: 900;
            color: #94a3b8;
            text-transform: uppercase;
            letter-spacing: 1px;
            display: block;
          }
          .receipt-meta-value {
            font-size: 11px;
            font-weight: 700;
            color: #334155;
            margin-top: 2px;
          }
          .receipt-box-container {
            position: relative;
            margin-top: 18px;
            margin-bottom: 18px;
          }
          .receipt-box-badge {
            position: absolute;
            top: -6px;
            left: 16px;
            background-color: #1e1b4b;
            color: #fff;
            font-size: 7px;
            font-weight: 900;
            text-transform: uppercase;
            letter-spacing: 1px;
            padding: 2px 8px;
            border-radius: 4px;
            z-index: 10;
          }
          .receipt-box-content {
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            padding: 14px;
            padding-top: 18px;
            background-color: #fff;
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px 16px;
          }
          .receipt-detail-item {
            display: flex;
            align-items: start;
            gap: 8px;
          }
          .receipt-detail-icon {
            width: 24px;
            height: 24px;
            border-radius: 8px;
            background-color: #f8fafc;
            border: 1px solid #f1f5f9;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
          }
          .receipt-detail-label {
            font-size: 7px;
            font-weight: 900;
            color: #94a3b8;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            display: block;
          }
          .receipt-detail-value {
            font-size: 11px;
            font-weight: 700;
            color: #1e293b;
            display: block;
            margin-top: 2px;
          }
          .receipt-total-paid-box {
            background-color: #ecfdf5;
            border: 1px solid #d1fae5;
            border-radius: 12px;
            padding: 12px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            color: #065f46;
            margin-top: 15px;
            margin-bottom: 10px;
          }
          .receipt-total-paid-label {
            font-size: 9px;
            font-weight: 900;
            text-transform: uppercase;
            letter-spacing: 1.5px;
          }
          .receipt-total-paid-value {
            font-size: 20px;
            font-weight: 900;
            font-family: sans-serif;
          }
          .receipt-words-box {
            display: flex;
            align-items: center;
            gap: 6px;
            font-size: 8.5px;
            color: #64748b;
            font-weight: 600;
            margin-bottom: 15px;
          }
          .receipt-words-icon {
            width: 16px;
            height: 16px;
            border-radius: 50%;
            background-color: #f5f3ff;
            border: 1px solid #e0e7ff;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 8px;
            color: #4338ca;
            font-weight: bold;
          }
          .receipt-footer-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 12px;
            margin-top: 15px;
            margin-bottom: 15px;
          }
          .receipt-qr-box {
            display: flex;
            gap: 8px;
            align-items: start;
          }
          .receipt-qr-img {
            width: 56px;
            height: 56px;
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            padding: 4px;
            background-color: #fff;
            flex-shrink: 0;
          }
          .receipt-footer-text-block {
            display: flex;
            flex-direction: column;
            gap: 6px;
            border-left: 1px solid #f1f5f9;
            padding-left: 12px;
            font-size: 8.5px;
            color: #64748b;
            font-weight: 600;
          }
          .receipt-seal-box {
            display: flex;
            justify-content: center;
            align-items: center;
            border-left: 1px solid #f1f5f9;
            padding-left: 12px;
          }
          .receipt-seal-stamp {
            width: 56px;
            height: 56px;
            border-radius: 50%;
            border: 3px double rgba(67, 56, 202, 0.6);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            position: relative;
            transform: rotate(-6deg);
            background-color: #fff;
          }
          .receipt-signature-box {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: flex-end;
            border-left: 1px solid #f1f5f9;
            padding-left: 12px;
            text-align: center;
          }
          .receipt-signature-line {
            width: 64px;
            border-top: 1px solid #cbd5e1;
            margin: 2px 0;
          }
          .receipt-warning-banner {
            background-color: #0f172a;
            color: #fff;
            border-radius: 12px;
            padding: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 6px;
            font-size: 7.5px;
            font-weight: 900;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <!-- Header -->
          <div class="header">
            <div class="header-side">${logoHTML}</div>
            <div class="header-center">
              <h1>NextGen Computer Training Institute, Muskara</h1>
              <h2>Admission Form</h2>
            </div>
            <div class="header-side">${logoHTML}</div>
          </div>
          
          <div class="form-body">
            <!-- Absolutely positioned photo box -->
            <div class="photo-box">
              ${studentData.photoURL ? `<img src="${studentData.photoURL}" alt="Student Photo" />` : 'Photo'}
            </div>

            <!-- Student Details Section -->
            <div class="section">
              <div class="section-title">Student Details</div>
              
              <div class="row">
                <div class="col-fill w-70">
                  <span class="label">Full Name:</span>
                  <span class="value-line">${finalName}</span>
                </div>
              </div>

              <div class="row">
                <div class="col-fill w-70">
                  <span class="label">Father's Name:</span>
                  <span class="value-line">${studentData.fatherName || ''}</span>
                </div>
              </div>

              <div class="row">
                <div class="col-fill w-70">
                  <span class="label">Mother's Name:</span>
                  <span class="value-line">${studentData.motherName || ''}</span>
                </div>
              </div>

              <div class="row">
                <div class="col" style="margin-right: 30px;">
                  <span class="label">Date of Birth:</span>
                  <div class="digit-box-container">
                    ${getDigitBoxesHTML(finalDOB, 8, true)}
                  </div>
                </div>
                <div class="col">
                  <span class="label" style="margin-right: 15px;">Gender:</span>
                  <div class="checkbox-item">
                    <div class="check-square">${isMale ? '✓' : ''}</div>
                    <span>Male</span>
                  </div>
                  <div class="checkbox-item">
                    <div class="check-square">${isFemale ? '✓' : ''}</div>
                    <span>Female</span>
                  </div>
                </div>
              </div>

              <div class="row">
                <div class="col">
                  <span class="label">Mobile Number:</span>
                  <div class="digit-box-container">
                    ${getDigitBoxesHTML(finalPhone, 10)}
                  </div>
                </div>
              </div>

              <div class="row">
                <div class="col">
                  <span class="label">Aadhaar Number:</span>
                  <div class="digit-box-container">
                    ${getDigitBoxesHTML(finalAadhaar, 12)}
                  </div>
                </div>
              </div>

              <div class="row">
                <div class="col-fill">
                  <span class="label">Email ID:</span>
                  <span class="value-line" style="text-transform: none;">${studentData.email || ''}</span>
                </div>
              </div>

              <div class="row">
                <div class="col-fill">
                  <span class="label">Address:</span>
                  <span class="value-line">${studentData.address || ''}</span>
                </div>
              </div>
            </div>

            <!-- Course Details Section -->
            <div class="section">
              <div class="section-title">Course Details</div>
              
              <div class="row">
                <div class="col-fill w-50">
                  <span class="label">Selected Course:</span>
                  <span class="value-line">${finalCourse}</span>
                </div>
                <div class="col-fill w-50">
                  <span class="label">Batch Timing:</span>
                  <span class="value-line">${studentData.batchTiming || ''}</span>
                </div>
              </div>

              <div class="row">
                <div class="col" style="margin-right: 30px;">
                  <span class="label">Date of Admission:</span>
                  <div class="digit-box-container">
                    ${getDigitBoxesHTML(finalAdmissionDate, 8, true)}
                  </div>
                </div>
              </div>

              <div class="row">
                <div class="col-fill w-50">
                  <span class="label">Total Course Fee:</span>
                  <span class="value-line">${formattedTotalFee}</span>
                </div>
                <div class="col-fill w-50">
                  <span class="label">Fee Paid:</span>
                  <span class="value-line">${formattedFeePaid}</span>
                </div>
              </div>

              <div class="row">
                <div class="col">
                  <span class="label" style="margin-right: 15px;">Payment Mode:</span>
                  <div class="checkbox-item">
                    <div class="check-square">${isCash ? '✓' : ''}</div>
                    <span>Cash</span>
                  </div>
                  <div class="checkbox-item">
                    <div class="check-square">${isOnline ? '✓' : ''}</div>
                    <span>Online</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Declaration Section -->
            <div class="section">
              <div class="section-title">Declaration</div>
              <div class="declaration-text">
                I hereby declare that the information provided above is true to the best of my knowledge. I shall follow all the rules and regulations of the institute.
              </div>
              
              <div class="signatures-row">
                <div class="signature-col">
                  <div class="signature-line"></div>
                  <div class="signature-label">Signature of Student</div>
                </div>
                <div class="signature-col">
                  <div class="signature-line"></div>
                  <div class="signature-label">Signature of Guardian</div>
                </div>
              </div>
            </div>

            <!-- For Office Use Only Box -->
            <div class="office-box">
              <div class="office-box-title">For Office Use Only</div>
              <div class="row" style="margin-bottom: 0;">
                <div class="col-fill w-50">
                  <span class="label">Admission Taken By:</span>
                  <span class="value-line">${studentData.admissionTakenBy || ''}</span>
                </div>
                <div class="col-fill w-50">
                  <span class="label">Receipt Number:</span>
                  <span class="value-line">${finalReceiptNumber}</span>
                </div>
              </div>
            </div>

            <!-- Student Portal Login Credentials -->
            ${studentData.password ? `
            <div class="office-box" style="margin-top: 15px; border-color: #10b981; background-color: #f0fdf4;">
              <div class="office-box-title" style="color: #15803d; letter-spacing: 0.5px;">Student Portal Login Credentials (Student Copy)</div>
              <div class="row" style="margin-bottom: 0;">
                <div class="col-fill w-40">
                  <span class="label">Portal URL:</span>
                  <span class="value-line" style="text-transform: none; color: #166534; font-family: monospace; font-size: 11px;">${window.location.origin}/login</span>
                </div>
                <div class="col-fill w-35">
                  <span class="label">Login Email:</span>
                  <span class="value-line" style="text-transform: none; font-family: monospace; font-size: 11px;">${studentData.email || ''}</span>
                </div>
                <div class="col-fill w-25">
                  <span class="label">Password:</span>
                  <span class="value-line" style="text-transform: none; font-family: monospace; font-size: 11px; font-weight: 700;">${studentData.password}</span>
                </div>
              </div>
            </div>
            ` : ''}
            
            <!-- Page Break and Receipt Section -->
            <div class="page-break"></div>
            
            <div class="receipt-card">
              
              <!-- Background Paid Stamp Watermark -->
              <div class="receipt-watermark">
                <img src="${paidStampAbsoluteURL}" alt="Paid Stamp Watermark" />
              </div>

              <!-- PAID Stamp overlay -->
              <div class="paid-stamp-overlay">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 4px;"><circle cx="12" cy="12" r="10"></circle><path d="m9 12 2 2 4-4"></path></svg>
                <span>PAID</span>
              </div>

              <!-- Receipt Header (Logo + Institute details) -->
              <div style="display: flex; align-items: start; border-bottom: 1px solid #f1f5f9; padding-bottom: 8px;">
                <div class="receipt-logo-circle">
                  <img src="${logoAbsoluteURL}" alt="Logo" style="width: 100%; height: 100%; object-fit: contain;" />
                </div>
                <div>
                  <h3 class="receipt-header-title">Nextgen computer training institute</h3>
                  <p class="receipt-header-tagline">Empowering Minds, Shaping Futures</p>
                  
                  <div class="receipt-header-contacts">
                    <div style="display: flex; align-items: center; gap: 4px;">
                      <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#4338ca" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                      <span>Near Shri Jaylal Vidya Mandir , Muskara</span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 4px;">
                      <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#4338ca" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                      <span>+91 9140737374</span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 4px;">
                      <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#4338ca" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"></rect><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path></svg>
                      <span>nextgencomputermuskara@gmail.com</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Invoice Meta details columns -->
              <div class="receipt-meta-grid">
                <div>
                  <span class="receipt-meta-label">Receipt No.</span>
                  <span class="receipt-meta-value" style="font-family: monospace; color: #312e81; display: block;">${finalReceiptNumber}</span>
                </div>
                <div style="border-left: 1px solid #f1f5f9; padding-left: 16px;">
                  <span class="receipt-meta-label">Date</span>
                  <span class="receipt-meta-value" style="display: block;">${finalAdmissionDate}</span>
                </div>
                <div style="border-left: 1px solid #f1f5f9; padding-left: 16px;">
                  <span class="receipt-meta-label">Receipt Time</span>
                  <span class="receipt-meta-value" style="display: block;">${new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>

              <!-- Student Enrolment information block -->
              <div class="receipt-box-container">
                <div class="receipt-box-badge">Student Details</div>
                <div class="receipt-box-content">
                  
                  <div class="receipt-detail-item">
                    <div class="receipt-detail-icon">
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                    </div>
                    <div>
                      <span class="receipt-detail-label">Student Name</span>
                      <span class="receipt-detail-value">${finalName}</span>
                    </div>
                  </div>
                  
                  <div class="receipt-detail-item">
                    <div class="receipt-detail-icon">
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"></path><path d="M14 2v4a2 2 0 0 0 2 2h4"></path><path d="M10 9H8"></path><path d="M16 13H8"></path><path d="M16 17H8"></path></svg>
                    </div>
                    <div>
                      <span class="receipt-detail-label">Enrollment Roll No.</span>
                      <span class="receipt-detail-value">${studentData.rollNumber || 'NG-' + new Date().getFullYear() + '-XXX'}</span>
                    </div>
                  </div>
                  
                  <div class="receipt-detail-item">
                    <div class="receipt-detail-icon">
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>
                    </div>
                    <div>
                      <span class="receipt-detail-label">Course</span>
                      <span class="receipt-detail-value">${finalCourse}</span>
                    </div>
                  </div>
                  
                  <div class="receipt-detail-item">
                    <div class="receipt-detail-icon">
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="14" x="2" y="5" rx="2"></rect><line x1="2" x2="22" y1="10" y2="10"></line></svg>
                    </div>
                    <div>
                      <span class="receipt-detail-label">Payment Method</span>
                      <span class="receipt-detail-value" style="text-transform: uppercase;">${studentData.paymentMode || 'Cash'}</span>
                    </div>
                  </div>
                  
                </div>
              </div>

              <!-- Table of Particulars (Billing description & amount) -->
              <div class="receipt-box-container">
                <div class="receipt-box-badge">Fee Details</div>
                <table class="receipt-table" style="width: 100%; border-collapse: collapse; margin-top: 10px;">
                  <thead>
                    <tr style="background-color: rgba(67, 56, 202, 0.05); text-align: left; border-bottom: 2px solid #cbd5e1;">
                      <th style="padding: 6px 10px; font-weight: 700; color: #1e1b4b; font-size: 8px; text-transform: uppercase; width: 60px;">S. No.</th>
                      <th style="padding: 6px 10px; font-weight: 700; color: #1e1b4b; font-size: 8px; text-transform: uppercase;">Description</th>
                      <th style="padding: 6px 10px; font-weight: 700; color: #1e1b4b; font-size: 8px; text-transform: uppercase; text-align: right; width: 120px;">Amount (INR)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style="border-bottom: 1px solid #e2e8f0; font-size: 11px; font-weight: 600;">
                      <td style="padding: 10px; color: #94a3b8; font-family: monospace;">1</td>
                      <td style="padding: 10px; color: #334155;">
                        Installment Month — ${new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                      </td>
                      <td style="padding: 10px; text-align: right; color: #334155; font-family: monospace;">
                        ${parseFloat(studentData.totalFee || 0).toFixed(2)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <!-- Total Paid Block -->
              <div class="receipt-total-paid-box">
                <span class="receipt-total-paid-label">Total Paid</span>
                <span class="receipt-total-paid-value">₹${parseFloat(studentData.feePaid || 0).toFixed(2)}</span>
              </div>

              <!-- Amount in Words -->
              <div class="receipt-words-box">
                <div class="receipt-words-icon">₹</div>
                <span>Amount in Words:</span>
                <span style="font-weight: 700; color: #334155; font-style: italic;">
                  Rupees ${amountInWords} Only
                </span>
              </div>

              <!-- Dotted separator line -->
              <div style="border-top: 1px dashed #cbd5e1; margin: 15px 0;"></div>

              <!-- Verification Grid Footer -->
              <div class="receipt-footer-grid">
                <!-- Scan to Verify QR Code -->
                <div class="receipt-qr-box">
                  <div class="receipt-qr-img">
                    <img 
                      src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(`Receipt: ${finalReceiptNumber}, Student: ${finalName}, Course: ${finalCourse}, Amount: ₹${studentData.feePaid}`)}" 
                      alt="QR Verification" 
                      style="width: 100%; height: 100%; object-fit: contain;"
                    />
                  </div>
                  <div>
                    <span style="font-size: 7px; font-weight: 900; color: #94a3b8; text-transform: uppercase; display: block; letter-spacing: 0.5px;">Scan to Verify</span>
                    <span style="font-size: 6px; color: #94a3b8; display: block; margin-top: 3px; line-height: 1.3;">
                      Scan this QR code to verify the authenticity of this receipt.
                    </span>
                  </div>
                </div>

                <!-- Metadata Generation details -->
                <div class="receipt-footer-text-block">
                  <div>
                    <span style="font-size: 6.5px; font-weight: 900; color: #94a3b8; text-transform: uppercase; display: block;">Generated On</span>
                    <span style="color: #475569; display: block; margin-top: 2px;">${finalAdmissionDate}, ${new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <div>
                    <span style="font-size: 6.5px; font-weight: 900; color: #94a3b8; text-transform: uppercase; display: block;">Generated By</span>
                    <span style="color: #475569; display: block; margin-top: 2px; text-overflow: ellipsis; overflow: hidden; white-space: nowrap; max-w: 80px;">Nextgen Management</span>
                  </div>
                </div>

                <!-- Double circular Verified Seal stamp -->
                <div class="receipt-seal-box">
                  <div class="receipt-seal-stamp">
                    <div style="font-size: 4.5px; font-weight: 900; color: rgba(67, 56, 202, 0.7); text-transform: uppercase; letter-spacing: 1px; line-height: 1.1;">NEXTGEN</div>
                    <div style="font-size: 3.5px; font-weight: 800; color: rgba(99, 102, 241, 0.7); text-transform: uppercase; margin-top: 1px;">COMPUTER</div>
                    <div style="font-size: 4.5px; font-weight: 900; color: rgba(67, 56, 202, 0.7); text-transform: uppercase; letter-spacing: 1px; margin-top: 1px; line-height: 1.1;">MUSKARA</div>
                    <div style="position: absolute; inset: 2px; border-radius: 50%; border: 1px dashed rgba(67, 56, 202, 0.3);"></div>
                  </div>
                </div>

                <!-- Mock handwritten Signature -->
                <div class="receipt-signature-box">
                  <span style="font-family: 'Brush Script MT', cursive; font-size: 15px; color: rgba(67, 56, 202, 0.8); line-height: 1;">
                    Sanjay Rajoot
                  </span>
                  <div class="receipt-signature-line"></div>
                  <span style="font-size: 7.5px; font-weight: 900; color: #94a3b8; text-transform: uppercase; display: block; line-height: 1;">Authorized Signature</span>
                  <span style="font-size: 6px; color: #64748b; margin-top: 1px; display: block; line-height: 1;">Nextgen Computer Training</span>
                </div>
              </div>

              <!-- Bottom warning banner -->
              <div class="receipt-warning-banner">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#c7d2fe" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 6px;"><path d="M20 13c0 5-3.5 7.5-7.66 9.7a1 1 0 0 1-.68 0C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.5 3.8 17 5 19 5a1 1 0 0 1 1 1z"></path><path d="m9 12 2 2 4-4"></path></svg>
                <span>This is a computer generated receipt and does not require any physical signature.</span>
              </div>

            </div>

        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
              window.onafterprint = function() {
                window.close();
              };
            }, 500);
          }
        </script>
      </body>
    </html>
  `);
  printWindow.document.close();
};
