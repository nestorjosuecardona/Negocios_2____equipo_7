import {
    ArrowRight,
    BadgeCheck,
    Car,
    Headphones,
    Lightbulb,
    ShieldCheck,
    Truck,
    Wrench,
} from 'lucide-react';

import {
    Link,
} from 'react-router-dom';

import StoreHeader
    from '../../components/store/StoreHeader';

import '../../styles/store.css';

const categories = [
    {
        name: 'Iluminación',
        description:
            'Faros LED, barras y accesorios para mejorar la visibilidad.',
        icon: Lightbulb,
    },
    {
        name: 'Audio',
        description:
            'Sonido, bocinas y accesorios para mejorar cada viaje.',
        icon: Headphones,
    },
    {
        name: 'Seguridad',
        description:
            'Sensores, cámaras y accesorios para proteger tu automóvil.',
        icon: ShieldCheck,
    },
    {
        name: 'Personalización',
        description:
            'Detalles para interior y exterior que hacen diferente tu auto.',
        icon: Car,
    },
];

export default function Landing() {
    return (
        <div className="store-page">

            <StoreHeader />

            <main>

                <section className="store-hero">

                    <div className="store-hero-glow" />

                    <div className="store-hero-content">

                        <span className="store-eyebrow">
                            <BadgeCheck
                                size={17}
                            />

                            Accesorios para llevar tu auto al siguiente nivel
                        </span>

                        <h1>
                            Personaliza tu auto.
                            <span>
                                Hazlo tuyo.
                            </span>
                        </h1>

                        <p>
                            Encuentra iluminación,
                            audio, tecnología,
                            seguridad y accesorios
                            seleccionados para
                            transformar tu vehículo.
                        </p>

                        <div className="store-hero-actions">

                            <Link
                                to="/catalogo"
                                className="store-primary-button"
                            >
                                Explorar productos

                                <ArrowRight
                                    size={18}
                                />
                            </Link>

                            <Link
                                to="/registro"
                                className="store-secondary-button"
                            >
                                Crear mi cuenta
                            </Link>

                        </div>

                        <div className="store-trust">

                            <div>
                                <Truck
                                    size={18}
                                />

                                <span>
                                    Productos disponibles
                                </span>
                            </div>

                            <div>
                                <ShieldCheck
                                    size={18}
                                />

                                <span>
                                    Compra segura
                                </span>
                            </div>

                            <div>
                                <Wrench
                                    size={18}
                                />

                                <span>
                                    Accesorios seleccionados
                                </span>
                            </div>

                        </div>

                    </div>

                    <div className="store-hero-visual">

                        <div className="store-car-card">

                            <div className="store-car-icon">
                                <Car
                                    size={105}
                                    strokeWidth={
                                        1.2
                                    }
                                />
                            </div>

                            <span>
                                NEGOCIOS 2
                            </span>

                            <strong>
                                Automotive Store
                            </strong>

                            <small>
                                Rendimiento · Estilo · Tecnología
                            </small>

                        </div>

                    </div>

                </section>

                <section className="store-section">

                    <div className="store-section-heading">

                        <span>
                            Explora
                        </span>

                        <h2>
                            Encuentra lo que necesita tu auto
                        </h2>

                        <p>
                            Categorías pensadas para
                            personalizar, mejorar y
                            proteger tu vehículo.
                        </p>

                    </div>

                    <div className="store-category-grid">

                        {categories.map(
                            (
                                category,
                            ) => {
                                const Icon =
                                    category.icon;

                                return (
                                    <Link
                                        to="/catalogo"
                                        className="store-category-card"
                                        key={
                                            category.name
                                        }
                                    >
                                        <span className="store-category-icon">
                                            <Icon
                                                size={
                                                    26
                                                }
                                            />
                                        </span>

                                        <h3>
                                            {
                                                category.name
                                            }
                                        </h3>

                                        <p>
                                            {
                                                category.description
                                            }
                                        </p>

                                        <span className="store-category-link">
                                            Ver productos

                                            <ArrowRight
                                                size={
                                                    15
                                                }
                                            />
                                        </span>
                                    </Link>
                                );
                            },
                        )}

                    </div>

                </section>

                <section
                    className="store-about"
                    id="nosotros"
                >

                    <div>
                        <span className="store-section-label">
                            Nosotros
                        </span>

                        <h2>
                            Accesorios automotrices con una experiencia digital moderna
                        </h2>
                    </div>

                    <p>
                        Negocios 2 es una tienda
                        digital enfocada en accesorios
                        para personalización,
                        iluminación, seguridad,
                        tecnología y comodidad
                        automotriz. Nuestro objetivo
                        es reunir productos útiles en
                        un catálogo sencillo y
                        accesible.
                    </p>

                </section>

                <section
                    className="store-contact"
                    id="contacto"
                >

                    <div className="store-contact-copy">

                        <span className="store-section-label">
                            Contacto
                        </span>

                        <h2>
                            ¿Buscas un accesorio específico?
                        </h2>

                        <p>
                            Escríbenos y podremos
                            ayudarte a encontrar una
                            opción para tu vehículo.
                        </p>

                    </div>

                    <form
                        className="store-contact-form"
                        onSubmit={(
                            event,
                        ) => {
                            event.preventDefault();
                        }}
                    >

                        <input
                            type="text"
                            placeholder="Nombre"
                        />

                        <input
                            type="email"
                            placeholder="Correo electrónico"
                        />

                        <textarea
                            rows="4"
                            placeholder="¿En qué podemos ayudarte?"
                        />

                        <button
                            type="submit"
                            className="store-primary-button"
                        >
                            Enviar mensaje
                        </button>

                    </form>

                </section>

            </main>

            <footer className="store-footer">

                <div>
                    <span className="store-logo">
                        N2
                    </span>

                    <div>
                        <strong>
                            Negocios 2
                        </strong>

                        <small>
                            Accesorios automotrices
                        </small>
                    </div>
                </div>

                <p>
                    © 2026 Negocios 2
                </p>

            </footer>

        </div>
    );
}