import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { MdPets, MdLock, MdMedicalServices, MdMail, MdVisibility, MdVisibilityOff } from 'react-icons/md';
import jaguarImg from '../assets/unnamed.png';

const LoginPage = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            await login(email, password);
            navigate('/dashboard');
        } catch (err) {
            console.error(err);
            setError(err.message || 'Error al iniciar sesión');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="h-screen w-full bg-white dark:bg-[#0f172a] text-slate-800 dark:text-slate-100 flex overflow-hidden font-sans">
            {/* Left Column - Image & Branding */}
            <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12 overflow-hidden bg-slate-900">
                <div className="absolute inset-0 z-0">
                    <img
                        alt="Jaguar and tropical wildlife composition"
                        className="w-full h-full object-cover"
                        src={jaguarImg}
                    />
                    <div className="absolute inset-0 bg-slate-900/40 mix-blend-multiply"></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent"></div>
                </div>

                <div className="relative z-10 flex items-center space-x-3">
                    <MdPets className="text-white text-4xl" />
                    <span className="text-white text-2xl font-bold tracking-wide">ZOOMAT</span>
                </div>

                <div className="relative z-10 max-w-xl mt-auto mb-20">
                    <h2 className="text-slate-300 font-medium tracking-widest text-sm uppercase mb-4">Gestión Clínica</h2>
                    <h1 className="text-4xl font-bold text-white leading-tight mb-6">
                        Conservación y Medicina Veterinaria de Vanguardia
                    </h1>
                    <p className="text-lg text-slate-200 font-light leading-relaxed">
                        Plataforma integral para el monitoreo clínico de especies en resguardo.
                    </p>
                </div>

                <div className="relative z-10 flex items-center text-sm text-slate-300 font-medium tracking-wide">
                    <span className="mr-2">© 2026 ZOOMAT</span>
                    <span className="w-1 h-1 bg-slate-400 rounded-full mx-2"></span>
                    <span className="flex items-center">
                        <MdLock className="text-[14px] mr-1" /> REGISTRO SEGURO
                    </span>
                </div>
            </div>

            {/* Right Column - Login Form */}
            <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 lg:p-16 bg-white dark:bg-[#0f172a] relative">
                <div className="lg:hidden absolute top-8 left-8 flex items-center space-x-2 text-[#1e293b] dark:text-white">
                    <MdPets className="text-3xl" />
                    <span className="text-xl font-bold">ZOOMAT</span>
                </div>

                <div className="w-full max-w-lg mx-auto flex flex-col justify-center h-full">
                    <div className="mb-10">
                        <div className="w-16 h-16 bg-[#17468d] rounded-full flex items-center justify-center shadow-lg mb-6">
                            <MdMedicalServices className="text-white text-4xl" />
                        </div>
                        <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-3 tracking-tight">¡Bienvenido de nuevo!</h2>
                        <p className="text-slate-500 dark:text-slate-400 text-base">Ingrese sus credenciales institucionales para acceder al sistema clínico.</p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 rounded bg-red-50 border border-red-200 text-red-600 text-sm flex items-center gap-2">
                            <MdLock className="text-lg" />
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="space-y-2">
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wide" htmlFor="email">Correo Institucional</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <MdMail className="text-slate-400 group-focus-within:text-[#17468d] transition-colors text-xl" />
                                </div>
                                <input
                                    className="block w-full pl-12 pr-4 py-3.5 text-base border border-slate-300 dark:border-slate-600 rounded bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#17468d] focus:border-transparent transition-all duration-200 shadow-sm"
                                    id="email"
                                    name="email"
                                    placeholder="nombre@zoomat.gob.mx"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wide" htmlFor="password">Contraseña</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <MdLock className="text-slate-400 group-focus-within:text-[#17468d] transition-colors text-xl" />
                                </div>
                                <input
                                    className="block w-full pl-12 pr-12 py-3.5 text-base border border-slate-300 dark:border-slate-600 rounded bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#17468d] focus:border-transparent transition-all duration-200 shadow-sm"
                                    id="password"
                                    name="password"
                                    placeholder="••••••••"
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                                <button
                                    type="button"
                                    className="absolute inset-y-0 right-0 pr-4 flex items-center cursor-pointer text-slate-400 hover:text-[#17468d] transition-colors"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <MdVisibilityOff className="text-xl" /> : <MdVisibility className="text-xl" />}
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center justify-between pt-1">
                            <div className="flex items-center">
                                <input
                                    className="h-4 w-4 text-[#17468d] focus:ring-[#17468d] border-gray-300 rounded cursor-pointer"
                                    id="remember-me"
                                    name="remember-me"
                                    type="checkbox"
                                />
                                <label className="ml-2 block text-sm text-slate-600 dark:text-slate-400 cursor-pointer" htmlFor="remember-me">Recordar este dispositivo</label>
                            </div>
                            <div className="text-sm">
                                <a className="font-semibold text-[#17468d] hover:text-[#0f2e63] dark:text-blue-400 dark:hover:text-blue-300 transition-colors" href="#">¿Olvidó su contraseña?</a>
                            </div>
                        </div>

                        <div className="pt-2">
                            <button
                                className={`w-full flex justify-center py-4 px-6 border border-transparent rounded shadow-md text-base font-bold text-white bg-[#1e293b] hover:bg-[#17468d] focus:outline-none focus:ring-4 focus:ring-[#17468d]/50 transition-all duration-200 transform active:scale-[0.99] tracking-widest uppercase ${isLoading ? 'opacity-70 cursor-wait' : ''}`}
                                type="submit"
                                disabled={isLoading}
                            >
                                {isLoading ? 'Iniciando...' : 'Iniciar Sesión'}
                            </button>
                        </div>

                        {/* New Registration Prompt */}
                        <div className="text-center pt-2">
                            <span className="text-slate-600 dark:text-slate-400 text-sm">¿No tienes una cuenta? </span>
                            <button
                                type="button"
                                onClick={() => navigate('/register')}
                                className="text-[#17468d] dark:text-blue-400 font-bold hover:underline bg-transparent border-none cursor-pointer"
                            >
                                Regístrate
                            </button>
                        </div>
                    </form>

                    <div className="mt-12 pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-wrap justify-center lg:justify-between items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                        <div className="flex space-x-6">
                            <a className="hover:text-slate-800 dark:hover:text-slate-200 transition-colors" href="#">Soporte Técnico</a>
                            <a className="hover:text-slate-800 dark:hover:text-slate-200 transition-colors" href="#">Privacidad</a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
