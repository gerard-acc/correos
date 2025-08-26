import "./header.css";
import correosLogo from "/LogoCornamusa.svg";
import { Link } from "@tanstack/react-router";

export default function Header() {
  return (
    <header className="header">
      <Link to="/" className="header__logo">
        <img src={correosLogo} className="logo" alt="Logo Correos" />
        Previsión de la demanda
      </Link>
      <div className="header__buttons">
        {/* <p>Alertas</p>
        <p>Perfil</p> */}
      </div>
    </header>
  );
}
