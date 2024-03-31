import React from 'react';
import '../style/Popup.css';

interface Props {
  show: boolean;
  title: string;
  content: JSX.Element | string;
  onClose: () => void;
}

const Popup: React.FC<Props> = ({ show, title, content, onClose }) => {
  if (!show) {
    return null;
  }

  return (
    <div className="popup" onClick={onClose}>
      <div className="popup-content" onClick={e => e.stopPropagation()}>
        <div className="popup-header">
          <h4 className="popup-title">{title}</h4>
        </div>
        <div className="popup-body">{content}</div>
        <div className="popup-footer">
          <button onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
};

export default Popup;