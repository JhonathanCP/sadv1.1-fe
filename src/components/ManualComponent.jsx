import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Modal, Button } from 'react-bootstrap';

export function ManualComponent({show, handleClose}) {
    const handleDownloadFormat = async () => {
        try {
            // Obtén una URL directa del archivo desde Google Drive
            const fileId = '                                                                                                                                                                  '; // Reemplaza con el ID de tu archivo en Google Drive
            const fileUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;
    
            // Crea un enlace invisible
            const link = document.createElement('a');
            link.href = fileUrl;
            link.rel = 'noopener noreferrer'; // Mejora la seguridad para evitar el "opener" de seguridad
            link.click();
    
            handleClose();
            document.body.removeChild(link);
        } catch (error) {
            console.error('Error al descargar el archivo:', error);
            // Maneja el error según sea necesario
        }
    };

    return (
        <Modal show={show} onHide={() =>{handleClose();}} size="xl">
            <Modal.Header closeButton>
                <Modal.Title>Manual de usuario</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {/* Embeber el PDF utilizando un iframe */}
                <iframe
                    title="PDF Viewer"
                    width="100%"
                    height="650vh"
                    src="https://drive.google.com/file/d/1IvLyPA9sNH0_QfYvsbI_caeoEixvmKRq/preview"
                ></iframe>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="success" onClick={handleDownloadFormat}>
                    Descargar manual de usuario
                </Button>
            </Modal.Footer>
        </Modal>
    );
}
