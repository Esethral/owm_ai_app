// 'use client';

// import { useEffect, useState } from 'react';
// import Image from 'next/image';

// export default function MatchesPage() {
//   const [bubbleVisible, setBubbleVisible] = useState(false);

//   useEffect(() => {
//     const t = setTimeout(() => setBubbleVisible(true), 100);
//     return () => clearTimeout(t);
//   }, []);

//   return (
//     <div className="relative flex flex-col items-center justify-center min-h-[calc(100vh-56px)] px-6 overflow-hidden">
//       <div className="flex flex-col items-center gap-5">
//         <Image
//           src="/images/Andy.png"
//           alt="Andy"
//           width={160}
//           height={160}
//           className="rounded-full shadow-[0_0_60px_rgba(99,102,241,0.3)]"
//         />
//         <div
//           className="relative bg-[#1a1a2e] border border-[#252540] rounded-2xl rounded-tl-sm px-5 py-3 mt-4"
//           style={{
//             transform: bubbleVisible ? 'translateX(0)' : 'translateX(-120vw)',
//             transition: 'transform 0.6s cubic-bezier(0.4,0,0.2,1)',
//           }}
//         >
//           <span className="absolute -top-[7px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[7px] border-b-[#252540]" />
//           <span className="absolute -top-[6px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[7px] border-b-[#1a1a2e]" />
//           <p className="text-[#f0f0ff] text-lg font-medium">It worked!</p>
//         </div>
//       </div>
//     </div>
//   );
// }
