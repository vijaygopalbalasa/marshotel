import React from 'react';
import { Link } from 'react-router-dom';
import './style/NavigationBar.css'; // Make sure this path is correct


interface NavigationBarProps {
  connected: boolean;
  onConnect: () => Promise<void>;
  onDisconnect: () => void;
}

const NavigationBar: React.FC<NavigationBarProps> = ({ connected, onConnect, onDisconnect }) => {
  return (
    <div className="navbar">
      <span className="logo">🏩 Mars Hotel</span>
      <Link to="/" className="nav-link">⌂ Home</Link>
      <Link to="/book" className="nav-link">Book</Link>
      <Link to="/list" className="nav-link">List</Link>
      {connected ? (
        <button onClick={onDisconnect} className="disconnect-button">Disconnect Wallet</button>
      ) : (
        <button onClick={onConnect} className="connect-button">Connect Wallet</button>
      )}
    </div>
  );
};

export default NavigationBar;
