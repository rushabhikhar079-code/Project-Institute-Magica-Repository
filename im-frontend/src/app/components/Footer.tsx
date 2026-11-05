// export function Footer() {
//   return (
//     <footer className="sticky bottom-0 bg-gray-900 text-white py-3 text-center mt-auto">
//       <p className="text-sm">Copyright © 2026 Techior Solutions Pvt. Ltd.</p>
//     </footer>
//   );
// }

// src/components/common/Footer.tsx

export function Footer() {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="w-full bg-gray-900 text-white py-3 text-center mt-auto">
      <p className="text-sm">
        Copyright © {currentYear} Techior Solutions Pvt. Ltd.
      </p>
    </footer>
  );
}
