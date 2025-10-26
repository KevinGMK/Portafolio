import { useState } from 'react';
import type { FormEvent } from 'react';
import emailjs from '@emailjs/browser';
import '../App.css';

const Envio = () => {
    const [formData, setFormData] = useState({
        nombre: '',
        email: '',
        mensaje: ''
    });
    const [enviando, setEnviando] = useState(false);
    const [mensajeEstado, setMensajeEstado] = useState('');

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setEnviando(true);
        setMensajeEstado('');

        try {
            await emailjs.send(
                'service_w6hk3hf', 
                'template_6nero6d',
                {
                    name: formData.nombre,
                    time: new Date().toLocaleString(),
                    message: `Email del remitente: ${formData.email}\n\nMensaje:\n${formData.mensaje}`,
                },
                'Csl-r2o7FiuL6dvhH'
            );
            setMensajeEstado('¡Mensaje enviado con éxito!');
            setFormData({ nombre: '', email: '', mensaje: '' });
        } catch (error) {
            setMensajeEstado('Error al enviar el mensaje. Por favor, intenta de nuevo.');
            console.error('Error:', error);
        } finally {
            setEnviando(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    return (
        <div className="envio-container">
            <h2>Contáctame</h2>
            <form onSubmit={handleSubmit} className="formulario-contacto">
                <div className="campo-formulario">
                    <label htmlFor="nombre">Nombre:</label>
                    <input
                        type="text"
                        id="nombre"
                        name="nombre"
                        value={formData.nombre}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="campo-formulario">
                    <label htmlFor="email">Email:</label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="campo-formulario">
                    <label htmlFor="mensaje">Mensaje:</label>
                    <textarea
                        id="mensaje"
                        name="mensaje"
                        value={formData.mensaje}
                        onChange={handleChange}
                        required
                    />
                </div>
                <button type="submit" disabled={enviando}>
                    {enviando ? 'Enviando...' : 'Enviar Mensaje'}
                </button>
                {mensajeEstado && (
                    <div className={mensajeEstado.includes('éxito') ? 'mensaje-exito' : 'mensaje-error'}>
                        {mensajeEstado}
                    </div>
                )}
            </form>
        </div>
    );
};

export default Envio;