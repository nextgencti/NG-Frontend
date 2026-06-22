import pptxgen from "pptxgenjs";
import logoImg from "../assets/logo.png";

/**
 * Dynamically exports a test and its questions into a highly premium 16:9 widescreen PowerPoint presentation.
 * 
 * @param {Object} test - Test metadata (title, course, totalMarks, duration, etc.)
 * @param {Array} questions - Array of questions containing options, correctAnswer, and marks
 * @param {Object} options - Options object: { isTeachingMode: boolean }
 */
export const exportTestToPPTX = async (test, questions, options = {}) => {
  const { isTeachingMode = false } = options;
  const pptx = new pptxgen();

  // Set Widescreen 16:9 layout
  pptx.layout = 'LAYOUT_16x9';

  // ─── SLIDE 1: COVER SLIDE ───
  const coverSlide = pptx.addSlide();
  coverSlide.background = { fill: '1E1B4B' }; // Deep solid Dark Indigo matching header

  // Premium white capsule badge container for logo to ensure high contrast/visibility
  coverSlide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
    x: 4.4,
    y: 0.4,
    w: 1.2,
    h: 1.2,
    fill: { color: 'FFFFFF' },
    line: { show: false }
  });

  // Brand Logo at top center of Cover Slide (layered on top of the white badge)
  coverSlide.addImage({
    path: window.location.origin + logoImg,
    x: 4.5,
    y: 0.5,
    w: 1.0,
    h: 1.0
  });

  // Title of the Assessment
  coverSlide.addText(test.title.toUpperCase(), {
    x: 0.5,
    y: 1.8,
    w: 9.0,
    h: 1.2,
    fontSize: 32,
    bold: true,
    color: 'FFFFFF',
    align: 'center',
    fontFace: 'Arial'
  });

  // Course Subtitle
  coverSlide.addText(`COURSE: ${test.course.toUpperCase()}`, {
    x: 0.5,
    y: 3.0,
    w: 9.0,
    h: 0.6,
    fontSize: 16,
    bold: true,
    color: 'C7D2FE',
    align: 'center',
    fontFace: 'Arial'
  });

  // Underline separator
  coverSlide.addShape(pptx.shapes.RECTANGLE, {
    x: 4.0,
    y: 3.7,
    w: 2.0,
    h: 0.03,
    fill: { color: '818CF8' },
    line: { show: false }
  });

  // Metadata Parameters Footer
  const metaText = `QUESTIONS: ${questions.length}   |   TOTAL MARKS: ${test.totalMarks || 100}M   |   TIME LIMIT: ${test.duration || '—'}`;
  coverSlide.addText(metaText, {
    x: 0.5,
    y: 4.2,
    w: 9.0,
    h: 0.5,
    fontSize: 11,
    bold: true,
    color: 'E2E8F0',
    align: 'center',
    fontFace: 'Arial'
  });

  // ─── SLIDE 2 TO N: QUESTIONS SLIDES ───
  questions.forEach((q, idx) => {
    const qSlide = pptx.addSlide();
    qSlide.background = { fill: '1E1B4B' }; // Premium Deep Dark Indigo theme matching Cover Slide

    // Header Metadata
    qSlide.addText(`QUESTION ${idx + 1} OF ${questions.length}`, {
      x: 0.6,
      y: 0.4,
      w: 4.0,
      h: 0.4,
      fontSize: 10,
      bold: true,
      color: 'A5B4FC', // Soft lavender/indigo-300
      fontFace: 'Arial'
    });

    // White capsule badge container for header logo contrast/visibility
    qSlide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: 8.8,
      y: 0.2,
      w: 0.7,
      h: 0.6,
      fill: { color: 'FFFFFF' },
      line: { show: false }
    });

    // Branding Logo in Header (Top Right, layered on top of the white badge)
    qSlide.addImage({
      path: window.location.origin + logoImg,
      x: 8.9,
      y: 0.25,
      w: 0.5,
      h: 0.5
    });

    qSlide.addText(`MARKS: ${q.marks || 1}`, {
      x: 7.2,
      y: 0.35,
      w: 1.5,
      h: 0.4,
      fontSize: 10,
      bold: true,
      color: 'A5B4FC', // Soft lavender/indigo-300
      align: 'right',
      fontFace: 'Arial'
    });

    // Elegant separator line
    qSlide.addShape(pptx.shapes.RECTANGLE, {
      x: 0.6,
      y: 0.8,
      w: 8.8,
      h: 0.02,
      fill: { color: '312E81' }, // Deep indigo-900 line
      line: { show: false }
    });

    // Question Statement
    qSlide.addText(q.question, {
      x: 0.6,
      y: 1.1,
      w: 8.8,
      h: 1.4,
      fontSize: 20,
      bold: true,
      color: 'FFFFFF', // Bright readable white
      fontFace: 'Arial',
      valign: 'middle'
    });

    // Options Grid Rendering
    const optKeys = ['A', 'B', 'C', 'D'].filter(k => q.options && q.options[k]);

    if (optKeys.length === 2) {
      // True/False format: Render as 1x2 large horizontal cards
      optKeys.forEach((key, optIdx) => {
        const optionText = q.options[key];
        const isCorrect = q.correctAnswer === key || 
                          (q.correctAnswer && 
                           (q.correctAnswer.toString().toUpperCase() === key || 
                            q.correctAnswer.toString().toUpperCase() === optionText.toString().toUpperCase()));
        const highlight = isTeachingMode && isCorrect;

        const cardBg = highlight ? '064E3B' : '25225E'; // Emerald green vs Elevated Indigo
        const cardBorder = highlight ? '10B981' : '3730A3'; // Glowing emerald border vs Deep indigo-800
        const textColor = highlight ? 'D1FAE5' : 'E2E8F0'; // Mint-white vs Slate-200 text
        const bulletBg = highlight ? '10B981' : '4F46E5'; // Emerald pill vs Brand indigo pill

        const xPos = 0.6 + optIdx * 4.6;
        const yPos = 3.0;

        // Card container
        qSlide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
          x: xPos,
          y: yPos,
          w: 4.4,
          h: 1.8,
          fill: { color: cardBg },
          line: { color: cardBorder, width: 1.5 }
        });

        // Pill circle for letter
        qSlide.addShape(pptx.shapes.OVAL, {
          x: xPos + 0.3,
          y: yPos + 0.65,
          w: 0.5,
          h: 0.5,
          fill: { color: bulletBg },
          line: { show: false }
        });

        qSlide.addText(key, {
          x: xPos + 0.3,
          y: yPos + 0.65,
          w: 0.5,
          h: 0.5,
          fontSize: 14,
          bold: true,
          color: 'FFFFFF',
          align: 'center',
          valign: 'middle',
          fontFace: 'Arial'
        });

        // Option Content text
        qSlide.addText(optionText, {
          x: xPos + 1.0,
          y: yPos + 0.3,
          w: 3.1,
          h: 1.2,
          fontSize: 16,
          bold: true,
          color: textColor,
          valign: 'middle',
          fontFace: 'Arial'
        });
      });
    } else {
      // Standard MCQ 4 Options: Render as 2x2 grid cards
      optKeys.forEach((key, optIdx) => {
        const optionText = q.options[key];
        const isCorrect = q.correctAnswer === key || 
                          (q.correctAnswer && 
                           (q.correctAnswer.toString().toUpperCase() === key || 
                            q.correctAnswer.toString().toUpperCase() === optionText.toString().toUpperCase()));
        const highlight = isTeachingMode && isCorrect;

        const cardBg = highlight ? '064E3B' : '25225E'; // Emerald green vs Elevated Indigo
        const cardBorder = highlight ? '10B981' : '3730A3'; // Glowing emerald border vs Deep indigo-800
        const textColor = highlight ? 'D1FAE5' : 'E2E8F0'; // Mint-white vs Slate-200 text
        const bulletBg = highlight ? '10B981' : '4F46E5'; // Emerald pill vs Brand indigo pill

        const col = optIdx % 2;
        const row = Math.floor(optIdx / 2);

        const xPos = 0.6 + col * 4.6;
        const yPos = 2.8 + row * 1.35;

        // Card container
        qSlide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
          x: xPos,
          y: yPos,
          w: 4.4,
          h: 1.1,
          fill: { color: cardBg },
          line: { color: cardBorder, width: 1.5 }
        });

        // Pill circle for letter
        qSlide.addShape(pptx.shapes.OVAL, {
          x: xPos + 0.25,
          y: yPos + 0.3,
          w: 0.5,
          h: 0.5,
          fill: { color: bulletBg },
          line: { show: false }
        });

        qSlide.addText(key, {
          x: xPos + 0.25,
          y: yPos + 0.3,
          w: 0.5,
          h: 0.5,
          fontSize: 13,
          bold: true,
          color: 'FFFFFF',
          align: 'center',
          valign: 'middle',
          fontFace: 'Arial'
        });

        // Option Content text
        qSlide.addText(optionText, {
          x: xPos + 0.9,
          y: yPos + 0.15,
          w: 3.3,
          h: 0.8,
          fontSize: 14,
          bold: true,
          color: textColor,
          valign: 'middle',
          fontFace: 'Arial'
        });
      });
    }
  });

  // ─── FINAL SLIDE: ANSWER KEY (IF EXAM MODE) ───
  if (!isTeachingMode) {
    const keySlide = pptx.addSlide();
    keySlide.background = { fill: '1E1B4B' }; // Dark primary theme

    // White capsule badge container for header logo contrast/visibility
    keySlide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: 8.8,
      y: 0.2,
      w: 0.7,
      h: 0.6,
      fill: { color: 'FFFFFF' },
      line: { show: false }
    });

    // Branding Logo in Header (Top Right, layered on top of the white badge)
    keySlide.addImage({
      path: window.location.origin + logoImg,
      x: 8.9,
      y: 0.25,
      w: 0.5,
      h: 0.5
    });

    // Header title
    keySlide.addText("ANSWER KEY", {
      x: 0.5,
      y: 0.6,
      w: 9.0,
      h: 0.6,
      fontSize: 24,
      bold: true,
      color: 'FFFFFF',
      align: 'center',
      fontFace: 'Arial'
    });

    keySlide.addText(`ASSESSMENT: ${test.title.toUpperCase()}`, {
      x: 0.5,
      y: 1.1,
      w: 9.0,
      h: 0.4,
      fontSize: 12,
      bold: true,
      color: 'C7D2FE',
      align: 'center',
      fontFace: 'Arial'
    });

    // Render answer grid columns programmatically
    const cols = 5;
    const itemsPerCol = Math.ceil(questions.length / cols);
    const maxRows = Math.max(1, itemsPerCol);
    const availableHeight = 3.4; // space from y=1.7 to y=5.1
    const rowHeight = Math.min(0.32, availableHeight / maxRows);
    const fontSize = Math.max(9, Math.min(13, Math.floor(rowHeight * 45)));

    for (let c = 0; c < cols; c++) {
      const colX = 0.8 + c * 1.76;
      for (let r = 0; r < itemsPerCol; r++) {
        const qIdx = c * itemsPerCol + r;
        if (qIdx < questions.length) {
          const qNum = qIdx + 1;
          const ans = questions[qIdx].correctAnswer || '—';
          const lineY = 1.7 + r * rowHeight;
          keySlide.addText(`Q${qNum < 10 ? '0' + qNum : qNum}:  [ ${ans} ]`, {
            x: colX,
            y: lineY,
            w: 1.6,
            h: rowHeight,
            fontSize: fontSize,
            color: 'FFFFFF',
            bold: true,
            align: 'left',
            fontFace: 'Courier New',
            valign: 'middle'
          });
        }
      }
    }
  }

  // Trigger browser package download
  const cleanTitle = test.title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
  await pptx.writeFile({ fileName: `nextgen_${cleanTitle}.pptx` });
};
