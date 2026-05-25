import Footer from "./Footer";

export default function PublicLayout({ children }) {
  return (
    <>
      {children}
      <Footer />
    </>
  );
}
