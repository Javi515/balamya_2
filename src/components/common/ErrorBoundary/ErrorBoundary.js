import React from 'react';
import { FaExclamationTriangle } from 'react-icons/fa';
import styles from './ErrorBoundary.module.css';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        this.setState({ error, errorInfo });
        console.error("Uncaught error:", error, errorInfo);
    }

    handleRetry = () => {
        window.location.reload();
    };

    handleGoHome = () => {
        window.location.href = '/';
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className={styles['error-boundary-container']}>
                    <div className={styles['error-card']}>
                        <FaExclamationTriangle className={styles['error-icon']} />
                        <h1 className={styles['error-title']}>¡Ups! Algo salió mal</h1>
                        <p className={styles['error-message']}>
                            Ha ocurrido un error inesperado en la aplicación.
                            Por favor, intenta recargar la página o volver al inicio.
                        </p>

                        <div className={styles['error-actions']}>
                            <button className={styles['btn-retry']} onClick={this.handleRetry}>
                                Recargar Página
                            </button>
                            <button className={styles['btn-home']} onClick={this.handleGoHome}>
                                Ir al Inicio
                            </button>
                        </div>

                        {process.env.NODE_ENV === 'development' && (
                            <details className={styles['error-details']}>
                                <summary>Ver detalles técnicos</summary>
                                <pre className={styles['error-pre']}>
                                    {this.state.error && this.state.error.toString()}
                                    <br />
                                    {this.state.errorInfo && this.state.errorInfo.componentStack}
                                </pre>
                            </details>
                        )}
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
