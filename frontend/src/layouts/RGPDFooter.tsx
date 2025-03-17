import { Link } from 'react-router-dom';

const RGPDFooter = () => {
  return (
    <div className="bottom-0 left-0 w-full bg-black text-white text-center p-1 z-40">
      <Link to="/mentions-legales" className="hover:underline">
        Mentions Légales
      </Link>
    </div>
  );
};

export default RGPDFooter;