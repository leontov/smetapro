import React from 'react';

interface Props {
  open: boolean;
  onAccept: () => void;
}

const PrivacyNotice: React.FC<Props> = ({ open, onAccept }) => {
  if (!open) return null;

  return (
    <div className="privacy-banner">
      <h4 style={{ margin: '0 0 8px' }}>Телеметрия и конфиденциальность</h4>
      <p style={{ margin: 0, fontSize: 14 }}>
        Мы используем Posthog и LogRocket, чтобы понимать, как вы работаете с приложением. Данные
        анонимизируются и нужны только для улучшения Smetapro.
      </p>
      <button type="button" onClick={onAccept}>
        Согласен
      </button>
    </div>
  );
};

export default PrivacyNotice;
