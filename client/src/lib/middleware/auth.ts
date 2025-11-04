// // lib/middleware/auth.ts
// "use client"
// import { redirect } from 'next/navigation';
// import { useAppSelector } from '../hooks/redux';

// export const withAuth = (Component: any) => {
//   return function ProtectedRoute(props: any) {
//     const { isAuthenticated, isLoading } = useAppSelector((state) => state.auth);

//     if (isLoading) {
//       return (
//         <div className="min-h-screen flex items-center justify-center">
//           <SpinnerbLoader className="w-10 h-10" />
//         </div>
//       );
//     }

//     if (!isAuthenticated) {
//       redirect('/auth/login');
//     }

//     return <Component {...props} />;
//   };
// };

// export const withoutAuth = (Component: any) => {
//   return function PublicRoute(props: any) {
//     const { isAuthenticated, isLoading } = useAppSelector((state) => state.auth);

//     if (isLoading) {
//       return (
//         <div className="min-h-screen flex items-center justify-center">
//           <SpinnerbLoader className="w-10 h-10" />
//         </div>
//       );
//     }

//     if (isAuthenticated) {
//       redirect('/');
//     }

//     return <Component {...props} />;
//   };
// };
