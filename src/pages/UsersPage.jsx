import React from 'react';
    import { Helmet } from 'react-helmet';
    import { motion } from 'framer-motion';
    
    const UsersPage = () => {
      return (
        <>
          <Helmet>
            <title>Usuarios - Meditation.AI</title>
            <meta name="description" content="Página de gestión de usuarios." />
          </Helmet>
          <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="text-center"
            >
              <h1 className="text-4xl font-bold text-slate-800">
                Página de Usuarios
              </h1>
              <p className="mt-4 text-lg text-slate-600">
                Este es el espacio para el contenido de la página de usuarios.
              </p>
            </motion.div>
          </div>
        </>
      );
    };
    
    export default UsersPage;