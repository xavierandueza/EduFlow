const Footer = () => {
  return (
    <footer className="chatbot-text-tertiary flex justify-between text-sm mt-6">
      {/* Back to Skills button */}
      <a
        href="/student/skills"
        className="flex h-8 w-max flex-none items-center justify-center border rounded-md text-xs px-3"
        aria-label="Back to Skills"
        style={{ backgroundColor: '#388a91', color: '#FFFFFF' }}
      >
        Back to Skills
      </a>

      {/* Powered by EduFlow with logo */}
      <div className="ml-auto flex flex-row items-center">
        <img src="/images/eduflow_logo.svg" alt="EduFlow logo" style={{ height: '40px' }} />
      </div>
    </footer>
  );
};

export default Footer;
