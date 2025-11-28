import { Documento } from '../../types/documento';
import { Actividad } from '../../types/actividad';
import BaseService from './baseService';

class DocumentoService extends BaseService {
  private baseUrl = '/api/documentos'; // Next.js proxy lo redirige a localhost:3001/documentos

  getDocumentos = async (): Promise<Documento[]> => {
    return this.fetchWithAuth(this.baseUrl);
  };

  getDocumentoById = async (id: number): Promise<Documento> => {
    return this.fetchWithAuth(`${this.baseUrl}/${id}`);
  };

  updateDocumento = async (id: number, data: Partial<Documento>): Promise<Documento> => {
    return this.fetchWithAuth(`${this.baseUrl}/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  };

  updateDocumentoWithFile = async (id: number, data: { nombre: string; tipoDoc: string }, file?: File): Promise<Documento> => {
    if (file) {
      const formData = new FormData();
      formData.append('archivo', file);
      formData.append('nombre', data.nombre);
      formData.append('tipoDoc', data.tipoDoc);

      return this.fetchWithAuth(`${this.baseUrl}/${id}`, {
        method: 'PATCH',
        body: formData,
      });
    } else {
      return this.updateDocumento(id, data);
    }
  };

  deleteDocumento = async (id: number): Promise<void> => {
    return this.fetchWithAuth(`${this.baseUrl}/${id}`, {
      method: 'DELETE',
    });
  };

  downloadDocumento = async (id: number): Promise<Blob> => {
    const response = await this.fetchWithAuthBlob(`${this.baseUrl}/${id}/download`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.blob();
  };

  viewDocumento = async (id: number): Promise<string> => {
    const response = await this.fetchWithAuthBlob(`${this.baseUrl}/${id}/ver`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const blob = await response.blob();
    return URL.createObjectURL(blob);
  };

  /**
<<<<<<< HEAD
   * Crea un acuse en PDF cuando se crea una actividad
   * @param actividad - La actividad recién creada
   * @param usuarioId - ID del usuario que creó la actividad
   * @param entregaId - ID de la entrega asociada
   */
  createAcuseActividad = async (
    actividad: Actividad,
    usuarioId: number,
    entregaId: number
  ): Promise<Documento[]> => {
    const formData = new FormData();

    // Generar el PDF del acuse
    const { default: jsPDF } = await import('jspdf');
    const docPDF = new jsPDF();
    
    // Configurar el documento
    docPDF.setFontSize(16);
    docPDF.text('Acuse de Creación de Actividad', 20, 30);
    
    docPDF.setFontSize(12);
    docPDF.text(`Fecha de Creación: ${new Date().toLocaleString('es-MX')}`, 20, 50);
    docPDF.text(`ID de Actividad: ${actividad.id}`, 20, 60);
    docPDF.text(`Asunto: ${actividad.asunto}`, 20, 70);
    docPDF.text(`Descripción: ${actividad.descripcion || 'N/A'}`, 20, 80);
    docPDF.text(`Instancia Emisora: ${actividad.instanciaEmisora}`, 20, 90);
    docPDF.text(`Instancia Receptora: ${actividad.instanciaReceptora}`, 20, 100);
    docPDF.text(`Tipo de Actividad: ${actividad.tipoActividad}`, 20, 110);
    docPDF.text(`Fecha Límite: ${new Date(actividad.fechaLimite).toLocaleDateString('es-MX')}`, 20, 120);
    docPDF.text(`Área: ${actividad.area.name}`, 20, 130);
    
    docPDF.setFontSize(10);
    docPDF.text('Este documento certifica la creación de la actividad en el sistema.', 20, 150);

    // Convertir PDF a blob y archivo
    const pdfBlob = docPDF.output('blob');
    const acuseFile = new File(
      [pdfBlob], 
      `acuse_actividad_${actividad.id}_${Date.now()}.pdf`, 
      { type: 'application/pdf' }
    );

    // Agregar el archivo al FormData
    formData.append('archivos', acuseFile);

    // Crear el objeto de documento para el acuse
    const documentoData: any = {
      nombre: `Acuse_Actividad_${actividad.id}`,
      tipoDoc: 'Acuse',
      idActividades: actividad.id,
      usuarioId: usuarioId,
      isAcuce: true
    };

    // Solo incluir entregaId si existe y es válido
    if (entregaId && entregaId > 0) {
      documentoData.entregaId = entregaId;
    }

    formData.append('documentos', JSON.stringify([documentoData]));

    // Enviar a la API
    return this.fetchWithAuth(`${this.baseUrl}/multiple`, {
      method: 'POST',
      body: formData,
    });
  };

=======
   * Sube múltiples documentos y genera un acuse automáticamente
   * @param files - Archivos a subir
   * @param documentos - Metadata de los documentos
   */
>>>>>>> 3a7898c424df373ef83d94898fbdca9d0de1d819
  uploadMultiple = async (
    files: File[],
    documentos: { nombre: string; tipoDoc: string; actividadId: number; entregaId: number; usuarioId: number; isAcuce?: boolean }[]
  ): Promise<Documento[]> => {
    console.log('📤 uploadMultiple: Iniciando subida de documentos...');
    console.log('📂 Archivos a subir:', files.length);
    console.log('📋 Metadata documentos:', documentos);

    const formData = new FormData();

    // Agregar los archivos del usuario
    files.forEach((file, index) => {
      console.log(`📎 Agregando archivo ${index + 1}:`, file.name);
      formData.append('archivos', file);
    });

    // Generar el acuse de documentos
    console.log('📄 Generando acuse PDF...');
    const { default: jsPDF } = await import('jspdf');
    const docPDF = new jsPDF();
    docPDF.setFontSize(16);
    docPDF.text('Acuse de Recepción de Documentos', 20, 30);
    docPDF.setFontSize(12);
    docPDF.text(`Fecha de Subida: ${new Date().toLocaleString()}`, 20, 50);
    docPDF.text('Al respecto se emite este presente digital y se adjunta la evidencia correspondiente', 20, 60);
    docPDF.text('Documentos recibidos correctamente:', 20, 70);

    documentos.forEach((doc, index) => {
      const yPos = 90 + (index * 10);
      docPDF.text(`${index + 1}. ${doc.nombre} - Tipo: ${doc.tipoDoc}`, 20, yPos);
    });

    const pdfBlob = docPDF.output('blob');
    const acuseFile = new File([pdfBlob], `acuse_documentos_${Date.now()}.pdf`, { type: 'application/pdf' });
    formData.append('archivos', acuseFile);
    console.log('✅ Acuse PDF generado y agregado');

    // Agregar metadata del acuse
    const acuseData = {
      nombre: `Acuse_Documentos_${Date.now()}`,
      tipoDoc: 'Acuse',
      actividadId: documentos[0].actividadId,
      entregaId: documentos[0].entregaId,
      usuarioId: documentos[0].usuarioId,
      isAcuce: true
    };

    const allDocumentos = [...documentos, acuseData];
    console.log('📦 Total documentos (incluyendo acuse):', allDocumentos.length);
    formData.append('documentos', JSON.stringify(allDocumentos));

    console.log('🚀 Enviando a API...');
    const result = await this.fetchWithAuth(`${this.baseUrl}/multiple`, {
      method: 'POST',
      body: formData,
    });
    console.log('✅ Documentos subidos exitosamente:', result);
    return result;
  };

  /**
   * Genera y sube un acuse de creación de actividad en PDF
   * ESTE MÉTODO SE EJECUTA SIEMPRE AL CREAR UNA ACTIVIDAD
   * @param actividad - La actividad recién creada
   * @param usuarioId - ID del usuario que creó la actividad
   * @param entregaId - ID de la entrega asociada
   */
  createActividadAcuse = async (actividad: Actividad, usuarioId: number, entregaId: number | null): Promise<Documento[]> => {
    console.log('📄 ========== CREANDO ACUSE DE ACTIVIDAD ==========');
    console.log('📌 Actividad ID:', actividad.id);
    console.log('👤 Usuario ID:', usuarioId);
    console.log('📦 Entrega ID:', entregaId);
    
    try {
      // PASO 1: Generar el PDF
      console.log('📝 PASO 1: Generando PDF del acuse...');
      const { default: jsPDF } = await import('jspdf');
      const docPDF = new jsPDF();
      
      // Título
      docPDF.setFontSize(18);
      docPDF.setFont('helvetica', 'bold');
      docPDF.text('ACUSE DE CREACIÓN DE ACTIVIDAD', 105, 30, { align: 'center' });
      
      // Línea decorativa
      docPDF.setLineWidth(0.5);
      docPDF.line(20, 35, 190, 35);
      
      // Información de la actividad
      docPDF.setFontSize(12);
      docPDF.setFont('helvetica', 'normal');
      docPDF.text(`Actividad ID: ${actividad.id}`, 20, 50);
      docPDF.text(`Asunto: ${actividad.asunto}`, 20, 60);
      docPDF.text(`Descripción: ${actividad.descripcion || 'Sin descripción'}`, 20, 70);
      docPDF.text(`Fecha de Creación: ${new Date(actividad.fechaCreacion).toLocaleString('es-MX')}`, 20, 80);
      docPDF.text(`Usuario ID: ${usuarioId}`, 20, 90);
      docPDF.text(`Entrega ID: ${entregaId}`, 20, 100);
      docPDF.text(`Instancia Emisora: ${actividad.instanciaEmisora}`, 20, 110);
      docPDF.text(`Instancia Receptora: ${actividad.instanciaReceptora}`, 20, 120);
      docPDF.text(`Tipo de Actividad: ${actividad.tipoActividad}`, 20, 130);
      docPDF.text(`Fecha Límite: ${new Date(actividad.fechaLimite).toLocaleDateString('es-MX')}`, 20, 140);
      
      // Nota al pie
      docPDF.setTextColor(100);
      docPDF.setFontSize(10);
      docPDF.text('Este documento es un acuse de recepción digital generado automáticamente.', 20, 160);
      docPDF.text('La actividad ha sido registrada en el sistema correctamente.', 20, 170);
      docPDF.text(`Generado el: ${new Date().toLocaleString('es-MX')}`, 20, 180);
      
      console.log('✅ PDF generado correctamente');

      // PASO 2: Convertir a blob y crear archivo
      console.log('📝 PASO 2: Convirtiendo PDF a archivo...');
      const pdfBlob = docPDF.output('blob');
      const fileName = `acuse_actividad_${actividad.id}_${Date.now()}.pdf`;
      const acuseFile = new File([pdfBlob], fileName, { type: 'application/pdf' });
      console.log('✅ Archivo creado:', fileName, 'Tamaño:', pdfBlob.size, 'bytes');

      // PASO 3: Crear FormData
      console.log('📝 PASO 3: Preparando FormData para envío...');
      const formData = new FormData();
      formData.append('archivos', acuseFile);
      console.log('✅ Archivo agregado a FormData');

      // PASO 4: Crear metadata del documento
      const documentos = [{
        nombre: `Acuse_Creacion_Actividad_${actividad.id}`,
        tipoDoc: 'Acuse',
        actividadId: actividad.id,
        entregaId: entregaId,
        usuarioId: usuarioId,
        isAcuce: true,
      }];
      
      console.log('📋 Metadata del documento:', documentos[0]);
      formData.append('documentos', JSON.stringify(documentos));
      console.log('✅ Metadata agregada a FormData');

      // PASO 5: Enviar a la API
      console.log('🚀 PASO 5: Enviando acuse a la API...');
      const result = await this.fetchWithAuth(`${this.baseUrl}/multiple`, {
        method: 'POST',
        body: formData,
      });
      
      console.log('✅ ========== ACUSE CREADO EXITOSAMENTE ==========');
      console.log('📊 Respuesta de la API:', result);
      console.log('📄 Documentos creados:', Array.isArray(result) ? result.length : 1);
      
      return result;
      
    } catch (error) {
      console.error('❌ ========== ERROR AL CREAR ACUSE ==========');
      console.error('Error completo:', error);
      console.error('Tipo:', error instanceof Error ? error.constructor.name : typeof error);
      console.error('Mensaje:', error instanceof Error ? error.message : String(error));
      
      if (error instanceof Error && error.stack) {
        console.error('Stack trace:', error.stack);
      }
      
      throw error;
    }
  };
}

export const documentoService = new DocumentoService();
export const { uploadMultiple, createAcuseActividad } = documentoService;