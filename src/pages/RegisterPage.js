import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdPets, MdLock, MdMedicalServices, MdMail, MdVisibility, MdVisibilityOff, MdPerson, MdBadge, MdPhone } from 'react-icons/md';
import jaguarImg from '../assets/unnamed.png';

const RegisterPage = () => {
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [role, setRole] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            // Mock registration - logic here would usually interact with a backend
            setTimeout(() => {
                alert('Cuenta creada exitosamente. Por favor, inicie sesión.');
                navigate('/login');
            }, 1000);
        } catch (err) {
            console.error(err);
            setError(err.message || 'Error al crear la cuenta');
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
                        Únase a nuestra plataforma integral para el monitoreo clínico de especies en resguardo.
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

            {/* Right Column - Register Form */}
            <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-6 lg:p-10 bg-white dark:bg-[#0f172a] relative overflow-y-auto">
                <div className="lg:hidden absolute top-6 left-6 flex items-center space-x-2 text-[#1e293b] dark:text-white">
                    <MdPets className="text-2xl" />
                    <span className="text-lg font-bold">ZOOMAT</span>
                </div>

                <div className="w-full max-w-lg mx-auto flex flex-col justify-center my-auto pt-8 lg:pt-0">
                    <div className="mb-6">
                        <div className="w-16 h-16 bg-[#17468d] rounded-full flex items-center justify-center shadow-lg mb-6">
                            <MdMedicalServices className="text-white text-4xl" />
                        </div>
                        <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-2 tracking-tight">Crear una cuenta</h2>
                        <p className="text-slate-500 dark:text-slate-400 text-sm">Complete sus datos para solicitar acceso al sistema clínico departamental.</p>
                    </div>

                    {error && (
                        <div className="mb-4 p-3 rounded bg-red-50 border border-red-200 text-red-600 text-sm flex items-center gap-2">
                            <MdLock className="text-lg" />
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleRegister} className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wide" htmlFor="name">Nombre Completo</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <MdPerson className="text-slate-400 group-focus-within:text-[#17468d] transition-colors text-xl" />
                                </div>
                                <input
                                    className="block w-full pl-12 pr-4 py-2.5 text-base border border-slate-300 dark:border-slate-600 rounded bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#17468d] focus:border-transparent transition-all duration-200 shadow-sm"
                                    id="name"
                                    name="name"
                                    placeholder="Ej. Dr. Juan Pérez"
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wide" htmlFor="phone">Teléfono Móvil</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <MdPhone className="text-slate-400 group-focus-within:text-[#17468d] transition-colors text-xl" />
                                    </div>
                                    <input
                                        className="block w-full pl-11 pr-3 py-2.5 text-base border border-slate-300 dark:border-slate-600 rounded bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#17468d] focus:border-transparent transition-all duration-200 shadow-sm"
                                        id="phone"
                                        name="phone"
                                        placeholder="10 dígitos"
                                        type="tel"
                                        pattern="[0-9]{10}"
                                        maxLength="10"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wide" htmlFor="role">Rol</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <MdBadge className="text-slate-400 group-focus-within:text-[#17468d] transition-colors text-xl" />
                                    </div>
                                    <select
                                        className="block w-full pl-10 pr-4 py-2.5 text-base border border-slate-300 dark:border-slate-600 rounded bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#17468d] focus:border-transparent transition-all duration-200 shadow-sm appearance-none cursor-pointer"
                                        id="role"
                                        name="role"
                                        value={role}
                                        onChange={(e) => setRole(e.target.value)}
                                        required
                                    >
                                        <option value="" disabled hidden>Seleccionar</option>
                                        <option value="aves">Aves</option>
                                        <option value="reptiles">Reptiles</option>
                                        <option value="anfibios">Anfibios</option>
                                        <option value="mamiferos">Mamíferos</option>
                                    </select>
                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
                                        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wide" htmlFor="email">Correo Institucional</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <MdMail className="text-slate-400 group-focus-within:text-[#17468d] transition-colors text-xl" />
                                </div>
                                <input
                                    className="block w-full pl-12 pr-4 py-2.5 text-base border border-slate-300 dark:border-slate-600 rounded bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#17468d] focus:border-transparent transition-all duration-200 shadow-sm"
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

                        <div className="space-y-1.5">
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wide" htmlFor="password">Contraseña</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <MdLock className="text-slate-400 group-focus-within:text-[#17468d] transition-colors text-xl" />
                                </div>
                                <input
                                    className="block w-full pl-12 pr-12 py-2.5 text-base border border-slate-300 dark:border-slate-600 rounded bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#17468d] focus:border-transparent transition-all duration-200 shadow-sm"
                                    id="password"
                                    name="password"
                                    placeholder="Mínimo 8 caracteres"
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    minLength={8}
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

                        <div className="pt-2">
                            <button
                                className={`w-full flex justify-center py-3.5 px-6 border border-transparent rounded shadow-md text-base font-bold text-white bg-[#1e293b] hover:bg-[#17468d] focus:outline-none focus:ring-4 focus:ring-[#17468d]/50 transition-all duration-200 transform active:scale-[0.99] tracking-widest uppercase ${isLoading ? 'opacity-70 cursor-wait' : ''}`}
                                type="submit"
                                disabled={isLoading}
                            >
                                {isLoading ? 'Procesando...' : 'Crear Cuenta'}
                            </button>
                        </div>

                        <div className="text-center mt-4">
                            <span className="text-slate-600 dark:text-slate-400 text-sm">¿Ya tienes una cuenta? </span>
                            <button
                                type="button"
                                onClick={() => navigate('/login')}
                                className="text-[#17468d] dark:text-blue-400 font-bold hover:underline bg-transparent border-none cursor-pointer p-0"
                            >
                                Iniciar Sesión
                            </button>
                        </div>
                    </form>

                    <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-wrap justify-between items-center gap-4 text-xs text-slate-500 dark:text-slate-400 hidden lg:flex">
                        <div className="flex space-x-6">
                            <a className="hover:text-slate-800 dark:hover:text-slate-200 transition-colors" href="#">Términos y Condiciones</a>
                            <a className="hover:text-slate-800 dark:hover:text-slate-200 transition-colors" href="#">Privacidad</a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;
