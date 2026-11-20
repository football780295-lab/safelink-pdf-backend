export interface GuideStep {
  title: string;
  desc: string;
}

export interface GuideFaq {
  question: string;
  answer: string;
}

export interface ToolGuideData {
  steps: GuideStep[];
  faqs: GuideFaq[];
}

export const TOOL_GUIDES: Record<string, Record<"en" | "bn", ToolGuideData>> = {
  compress: {
    en: {
      steps: [
        { title: "Upload PDF", desc: "Drag and drop or select your PDF file from your device (up to 50MB)." },
        { title: "Choose Level", desc: "Select Extreme (maximum compression), Recommended, or Low (HD)." },
        { title: "Download", desc: "Preview your savings percentage and download your compressed PDF instantly." },
      ],
      faqs: [
        { question: "How does PDF compression work?", answer: "Our engine optimizes embedded images, flattens unused font definitions, and compresses binary streams using Ghostscript and pikepdf without losing text clarity." },
        { question: "Is my document secure?", answer: "Yes! Your files are stored exclusively in temporary storage, never shared or logged, and automatically deleted within 15 minutes or immediately upon download." },
        { question: "Will compression reduce visual quality?", answer: "Recommended mode balances crisp typography and image sharpness with up to 85% file size reduction. Extreme mode is best for email attachments." },
      ],
    },
    bn: {
      steps: [
        { title: "পিডিএফ আপলোড করুন", desc: "আপনার ডিভাইস থেকে পিডিএফ ফাইলটি সিলেক্ট করুন (সর্বোচ্চ ৫০ মেগাবাইট)।" },
        { title: "কম্প্রেশন লেভেল বাছাই করুন", desc: "প্রয়োজনমতো রিকমেন্ডেড, এক্সট্রিম বা লো লেভেল নির্বাচন করুন।" },
        { title: "ডাউনলোড করুন", desc: "কত শতাংশ সাইজ কমল তা দেখে এক ক্লিকে ডাউনলোড করুন।" },
      ],
      faqs: [
        { question: "পিডিএফ কম্প্রেশন কীভাবে কাজ করে?", answer: "আমাদের উচ্চগতির ইঞ্জিন ফন্ট ও ছবির বাড়তি সাইজ কমিয়ে সাইজ ছোট করে টেক্সটের মান অক্ষুণ্ণ রাখে।" },
        { question: "আমার ফাইলের নিরাপত্তা নিশ্চিত?", answer: "অবশ্যই! আপনার ফাইল কখনোই সংরক্ষিত থাকে না, ডাউনলোডের সাথে সাথে এবং সর্বোচ্চ ১৫ মিনিটের মধ্যে স্বয়ংক্রিয়ভাবে মুছে যায়।" },
      ],
    },
  },
  merge: {
    en: {
      steps: [
        { title: "Select 2 or More PDFs", desc: "Upload multiple PDF documents from your phone or computer." },
        { title: "Reorder Documents", desc: "Arrange your files in the exact sequence you wish them to appear." },
        { title: "Merge & Save", desc: "Click Merge to combine all pages into a unified document with one click." },
      ],
      faqs: [
        { question: "How many files can I merge at once?", answer: "You can merge as many PDF files as you need up to our 50MB upload limit." },
        { question: "Are my page orientations preserved?", answer: "Yes, portrait and landscape pages retain their original orientation and formatting." },
      ],
    },
    bn: {
      steps: [
        { title: "পিডিএফ ফাইল নির্বাচন করুন", desc: "একাধিক পিডিএফ ফাইল সিলেক্ট বা ড্র্যাগ-অ্যান্ড-ড্রপ করুন।" },
        { title: "সিরিয়াল ঠিক করুন", desc: "যে ক্রমে জোড়া লাগাতে চান সেই অনুযায়ী ফাইলগুলো সাজিয়ে নিন।" },
        { title: "মার্জ ও ডাউনলোড", desc: "মার্জ বাটনে ক্লিক করে সাথে সাথে একটি সিঙ্গেল ফাইলে ডাউনলোড করুন।" },
      ],
      faqs: [
        { question: "এক সাথে কয়টি ফাইল মার্জ করা যায়?", answer: "৫০ মেগাবাইট সাইজ লিমিটের মধ্যে যেকোনো সংখ্যক ফাইল একসাথে মার্জ করা সম্ভব।" },
      ],
    },
  },
  split: {
    en: {
      steps: [
        { title: "Upload Source PDF", desc: "Select the PDF file you wish to extract or split pages from." },
        { title: "Select Pages", desc: "Enter page ranges (e.g. 1-3, 5, 8-10) or choose individual pages." },
        { title: "Export", desc: "Download the selected pages as a single PDF or as a ZIP of separate documents." },
      ],
      faqs: [
        { question: "Can I extract non-consecutive pages?", answer: "Yes! Specify any combination of pages like '1-4, 7, 9-12' to extract exactly what you need." },
        { question: "Will links and bookmarks remain intact?", answer: "Yes, inner links and layout structures are preserved across the extracted pages." },
      ],
    },
    bn: {
      steps: [
        { title: "পিডিএফ আপলোড করুন", desc: "যে পিডিএফ থেকে পেজ আলাদা করতে চান তা আপলোড করুন।" },
        { title: "পেজ রেঞ্জ নির্বাচন করুন", desc: "যে পেজগুলো আলাদা করতে চান তা লিখুন (যেমন ১-৩, ৫, ৮)।" },
        { title: "ডাউনলোড করুন", desc: "সিঙ্গেল পিডিএফ অথবা জিপ ফাইল হিসেবে আলাদা পেজগুলো ডাউনলোড করুন।" },
      ],
      faqs: [
        { question: "আলাদা আলাদা পেজ কীভাবে ডাউনলোড করব?", answer: "মোড হিসেবে 'জিপ' সিলেক্ট করলে প্রতিটি পেজ আলাদা ফাইল হিসেবে প্যাকেজ হয়ে ডাউনলোড হবে।" },
      ],
    },
  },
  "jpg-to-pdf": {
    en: {
      steps: [
        { title: "Upload Images", desc: "Select one or multiple JPG, JPEG, or PNG images." },
        { title: "Configure Layout", desc: "Choose page size (A4 or Fit to image) and page orientation." },
        { title: "Generate PDF", desc: "Convert all images into a polished, print-ready PDF document." },
      ],
      faqs: [
        { question: "Does image quality degrade?", answer: "No, our conversion engine wraps the raw image streams directly into the PDF container without recompression loss." },
        { question: "Can I mix PNG and JPG?", answer: "Yes, you can upload a mix of JPG, JPEG, and PNG images seamlessly." },
      ],
    },
    bn: {
      steps: [
        { title: "ছবি আপলোড করুন", desc: "এক বা একাধিক JPG অথবা PNG ছবি সিলেক্ট করুন।" },
        { title: "সাইজ ও ওরিয়েন্টেশন বাছাই করুন", desc: "A4 সাইজ বা ছবির নিজস্ব সাইজ এবং পোর্ট্রেট/ল্যান্ডস্কেপ সিলেক্ট করুন।" },
        { title: "পিডিএফ তৈরি করুন", desc: "এক ক্লিকে ছবিগুলো থেকে পিডিএফ তৈরি করে নিন।" },
      ],
      faqs: [
        { question: "ছবির কোয়ালিটি কি কমে যাবে?", answer: "না, মূল ছবির রেজ্যুলেশন সম্পূর্ণ ঠিক রেখেই পিডিএফ তৈরি করা হয়।" },
      ],
    },
  },
  "pdf-to-jpg": {
    en: {
      steps: [
        { title: "Upload PDF", desc: "Choose the PDF document you want to extract images from." },
        { title: "Select Resolution", desc: "Pick your target DPI (72, 150 standard, or 300 print quality)." },
        { title: "Download Images", desc: "Download all pages as a ZIP archive or save pages individually." },
      ],
      faqs: [
        { question: "What is the recommended DPI?", answer: "150 DPI is crisp and ideal for web viewing and sharing, while 300 DPI provides maximum clarity for printing." },
      ],
    },
    bn: {
      steps: [
        { title: "পিডিএফ আপলোড করুন", desc: "যে পিডিএফ ফাইল থেকে ছবি বের করতে চান তা সিলেক্ট করুন।" },
        { title: "রেজ্যুলেশন নির্বাচন করুন", desc: "১৫০ ডিপিআই বা হাই রেজ্যুলেশন ৩০০ ডিপিআই নির্বাচন করুন।" },
        { title: "ছবি ডাউনলোড করুন", desc: "এক ক্লিকে জিপ ফাইল অথবা প্রতিটি পেজ আলাদা ছবি হিসেবে ডাউনলোড করুন।" },
      ],
      faqs: [
        { question: "কোন ডিপিআই বাছাই করা ভালো?", answer: "সাধারণ ব্যবহারের জন্য ১৫০ ডিপিআই এবং প্রিন্ট করার জন্য ৩০০ ডিপিআই বাছাই করুন।" },
      ],
    },
  },
  protect: {
    en: {
      steps: [
        { title: "Upload PDF", desc: "Select the PDF file you wish to password-protect." },
        { title: "Set Strong Password", desc: "Enter and confirm your encryption password." },
        { title: "Encrypt & Download", desc: "Download your file securely encrypted with military-grade AES-256." },
      ],
      faqs: [
        { question: "What encryption standard is used?", answer: "We use standard AES-256 bit encryption, compatible with Adobe Acrobat and all standard PDF readers." },
        { question: "Does the server remember my password?", answer: "Never. Passwords are processed in-memory during encryption and immediately discarded from memory without logging." },
      ],
    },
    bn: {
      steps: [
        { title: "পিডিএফ আপলোড করুন", desc: "যে পিডিএফটি সুরক্ষিত করতে চান তা সিলেক্ট করুন।" },
        { title: "পাসওয়ার্ড দিন", desc: "শক্তিশালী পাসওয়ার্ড প্রবেশ করান এবং কনফার্ম করুন।" },
        { title: "এনক্রিপ্ট ও ডাউনলোড", desc: "AES-256 এনক্রিপশন যুক্ত সুরক্ষিত ফাইলটি ডাউনলোড করুন।" },
      ],
      faqs: [
        { question: "পাসওয়ার্ড কি সার্ভারে সংরক্ষিত হয়?", answer: "কখনোই না! পাসওয়ার্ড কোনো লগ বা ডেটাবেজে সংরক্ষিত হয় না।" },
      ],
    },
  },
  unlock: {
    en: {
      steps: [
        { title: "Upload Locked PDF", desc: "Select the password-protected PDF that you own or are authorized to open." },
        { title: "Enter Known Password", desc: "Input the current password you know to authorize decryption." },
        { title: "Remove Password", desc: "Download a completely decrypted PDF with security restrictions removed." },
      ],
      faqs: [
        { question: "Can this tool bypass unknown passwords?", answer: "No. This tool is strictly a convenience utility for removing passwords you already know. We do not support cracking or brute-forcing." },
      ],
    },
    bn: {
      steps: [
        { title: "লক করা ফাইল আপলোড করুন", desc: "পাসওয়ার্ড প্রটেক্টেড পিডিএফ ফাইলটি সিলেক্ট করুন।" },
        { title: "পাসওয়ার্ড দিন", desc: "ফাইলের বর্তমান পাসওয়ার্ডটি প্রবেশ করান।" },
        { title: "লক মুক্ত ফাইল ডাউনলোড", desc: "পাসওয়ার্ড রিমুভ হওয়া উন্মুক্ত পিডিএফটি ডাউনলোড করুন।" },
      ],
      faqs: [
        { question: "অজানা পাসওয়ার্ড কি ভাঙা সম্ভব?", answer: "না। এই টুলটি কেবলমাত্র আপনার নিজের জানা পাসওয়ার্ড মুছে ফেলার জন্য। পাসওয়ার্ড ক্র্যাকিং সমর্থিত নয়।" },
      ],
    },
  },
};
