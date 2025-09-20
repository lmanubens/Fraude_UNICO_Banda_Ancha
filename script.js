// Database structure for storing fraud reports
class FraudDatabase {
    constructor() {
        this.dbName = 'FraudeUnicoBandaAncha';
        this.version = 1;
        this.db = null;
        this.initDB();
    }

    async initDB() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.version);

            request.onerror = () => {
                console.error('Error opening database:', request.error);
                reject(request.error);
            };

            request.onsuccess = () => {
                this.db = request.result;
                console.log('Database opened successfully');
                resolve(this.db);
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;

                // Create fraud reports store
                const fraudStore = db.createObjectStore('fraudReports', {
                    keyPath: 'id',
                    autoIncrement: true
                });

                // Create indexes for searching
                fraudStore.createIndex('email', 'email', { unique: false });
                fraudStore.createIndex('referenciaCatastral', 'referenciaCatastral', { unique: false });
                fraudStore.createIndex('operadorDeclarante', 'operadorDeclarante', { unique: false });
                fraudStore.createIndex('fechaCreacion', 'fechaCreacion', { unique: false });

                // Create files store for uploaded files
                const filesStore = db.createObjectStore('fraudFiles', {
                    keyPath: 'id',
                    autoIncrement: true
                });

                filesStore.createIndex('reportId', 'reportId', { unique: false });
                filesStore.createIndex('fileType', 'fileType', { unique: false });

                console.log('Database structure created');
            };
        });
    }

    async saveReport(reportData) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['fraudReports'], 'readwrite');
            const store = transaction.objectStore('fraudReports');

            // Add timestamp
            reportData.fechaCreacion = new Date().toISOString();
            reportData.estado = 'pendiente';

            const request = store.add(reportData);

            request.onsuccess = () => {
                console.log('Report saved with ID:', request.result);
                resolve(request.result);
            };

            request.onerror = () => {
                console.error('Error saving report:', request.error);
                reject(request.error);
            };
        });
    }

    async saveFile(file, reportId, fileType) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = async (e) => {
                const fileData = {
                    reportId: reportId,
                    fileName: file.name,
                    fileType: fileType,
                    mimeType: file.type,
                    size: file.size,
                    data: e.target.result,
                    fechaSubida: new Date().toISOString()
                };

                const transaction = this.db.transaction(['fraudFiles'], 'readwrite');
                const store = transaction.objectStore('fraudFiles');
                const request = store.add(fileData);

                request.onsuccess = () => {
                    console.log('File saved with ID:', request.result);
                    resolve(request.result);
                };

                request.onerror = () => {
                    console.error('Error saving file:', request.error);
                    reject(request.error);
                };
            };

            reader.onerror = () => {
                reject(new Error('Error reading file'));
            };

            reader.readAsDataURL(file);
        });
    }

    async getAllReports() {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['fraudReports'], 'readonly');
            const store = transaction.objectStore('fraudReports');
            const request = store.getAll();

            request.onsuccess = () => {
                resolve(request.result);
            };

            request.onerror = () => {
                reject(request.error);
            };
        });
    }

    async getReportsByOperator(operator) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['fraudReports'], 'readonly');
            const store = transaction.objectStore('fraudReports');
            const index = store.index('operadorDeclarante');
            const request = index.getAll(operator);

            request.onsuccess = () => {
                resolve(request.result);
            };

            request.onerror = () => {
                reject(request.error);
            };
        });
    }

    async exportData() {
        try {
            const reports = await this.getAllReports();
            const dataStr = JSON.stringify(reports, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            
            const url = URL.createObjectURL(dataBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `fraude_unico_datos_${new Date().toISOString().split('T')[0]}.json`;
            link.click();
            
            URL.revokeObjectURL(url);
            return true;
        } catch (error) {
            console.error('Error exporting data:', error);
            return false;
        }
    }
}

// Form validation
class FormValidator {
    static validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    static validateCatastralReference(ref) {
        // Basic validation for Spanish cadastral reference
        const catastralRegex = /^[0-9]{7}[A-Z]{2}[0-9]{4}[A-Z]{1}[0-9]{4}[A-Z]{2}$/;
        return catastralRegex.test(ref.replace(/\s/g, ''));
    }

    static validatePhone(phone) {
        if (!phone) return true; // Optional field
        const phoneRegex = /^[+]?[0-9\s\-\(\)]{9,}$/;
        return phoneRegex.test(phone);
    }

    static validateRequiredField(value) {
        return value && value.trim().length > 0;
    }

    static validateDate(date) {
        if (!date) return true; // Optional field
        const selectedDate = new Date(date);
        const today = new Date();
        return selectedDate <= today;
    }

    static validateFileSize(file, maxSizeMB = 10) {
        return file.size <= maxSizeMB * 1024 * 1024;
    }

    static validateFileType(file) {
        const allowedTypes = [
            'application/pdf',
            'image/png',
            'image/jpeg',
            'image/gif',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'audio/mpeg',
            'video/mp4'
        ];
        return allowedTypes.includes(file.type);
    }
}

// Main application
class FraudReportApp {
    constructor() {
        this.database = new FraudDatabase();
        this.form = document.getElementById('fraudReportForm');
        this.initializeEventListeners();
        this.initializeDatabase();
    }

    async initializeDatabase() {
        try {
            await this.database.initDB();
            console.log('Application database initialized');
        } catch (error) {
            console.error('Failed to initialize database:', error);
            this.showMessage('Error al inicializar la base de datos. Algunas funcionalidades pueden no estar disponibles.', 'error');
        }
    }

    initializeEventListeners() {
        // Form submission
        this.form.addEventListener('submit', (e) => this.handleFormSubmit(e));

        // Real-time validation
        this.form.addEventListener('input', (e) => this.handleFieldValidation(e));
        this.form.addEventListener('change', (e) => this.handleFieldValidation(e));

        // File upload validation
        const fileInputs = this.form.querySelectorAll('input[type="file"]');
        fileInputs.forEach(input => {
            input.addEventListener('change', (e) => this.validateFiles(e));
        });

        // Add export functionality
        this.addExportButton();
    }

    handleFieldValidation(event) {
        const field = event.target;
        const formGroup = field.closest('.form-group');
        
        if (!formGroup) return;

        this.clearFieldError(formGroup);

        let isValid = true;
        let errorMessage = '';

        // Validate based on field type and requirements
        if (field.required && !FormValidator.validateRequiredField(field.value)) {
            isValid = false;
            errorMessage = 'Este campo es obligatorio';
        } else if (field.type === 'email' && field.value && !FormValidator.validateEmail(field.value)) {
            isValid = false;
            errorMessage = 'Ingresa un correo electrónico válido';
        } else if (field.name === 'referenciaCatastral' && field.value && !FormValidator.validateCatastralReference(field.value)) {
            isValid = false;
            errorMessage = 'Ingresa una referencia catastral válida (formato: 1234567CS1234S0001WX)';
        } else if (field.type === 'tel' && field.value && !FormValidator.validatePhone(field.value)) {
            isValid = false;
            errorMessage = 'Ingresa un número de teléfono válido';
        } else if (field.type === 'date' && field.value && !FormValidator.validateDate(field.value)) {
            isValid = false;
            errorMessage = 'La fecha no puede ser futura';
        }

        if (isValid) {
            this.markFieldSuccess(formGroup);
        } else {
            this.markFieldError(formGroup, errorMessage);
        }
    }

    validateFiles(event) {
        const fileInput = event.target;
        const formGroup = fileInput.closest('.form-group');
        const files = Array.from(fileInput.files);

        this.clearFieldError(formGroup);

        for (let file of files) {
            if (!FormValidator.validateFileSize(file)) {
                this.markFieldError(formGroup, `El archivo "${file.name}" es demasiado grande (máximo 10MB)`);
                return false;
            }

            if (!FormValidator.validateFileType(file)) {
                this.markFieldError(formGroup, `El archivo "${file.name}" no es de un tipo permitido`);
                return false;
            }
        }

        if (files.length > 0) {
            this.markFieldSuccess(formGroup);
        }

        return true;
    }

    async handleFormSubmit(event) {
        event.preventDefault();

        // Validate entire form
        if (!this.validateForm()) {
            this.showMessage('Por favor, corrige los errores en el formulario antes de enviar', 'error');
            return;
        }

        // Show loading state
        this.setFormLoading(true);

        try {
            // Collect form data
            const formData = this.collectFormData();
            
            // Save report to database
            const reportId = await this.database.saveReport(formData);

            // Save uploaded files
            await this.saveUploadedFiles(reportId);

            // Show success message
            this.showMessage('¡Denuncia enviada exitosamente! Tu caso ha sido registrado en la base de datos.', 'success');
            
            // Reset form
            this.form.reset();
            this.clearAllFieldStates();

            // Offer to export data
            this.showExportOption();

        } catch (error) {
            console.error('Error submitting form:', error);
            this.showMessage('Error al enviar la denuncia. Por favor, inténtalo de nuevo.', 'error');
        } finally {
            this.setFormLoading(false);
        }
    }

    collectFormData() {
        const formData = new FormData(this.form);
        const data = {};

        // Convert FormData to object
        for (let [key, value] of formData.entries()) {
            if (key.includes('[]') || data[key]) {
                // Handle multiple values (checkboxes)
                if (!data[key]) data[key] = [];
                data[key].push(value);
            } else {
                data[key] = value;
            }
        }

        // Remove file inputs from data (handled separately)
        delete data.pruebasCobertura;
        delete data.pruebasFaltaServicio;

        return data;
    }

    async saveUploadedFiles(reportId) {
        const fileInputs = [
            { input: 'pruebasCobertura', type: 'cobertura' },
            { input: 'pruebasFaltaServicio', type: 'faltaServicio' }
        ];

        for (let fileInputInfo of fileInputs) {
            const fileInput = document.getElementById(fileInputInfo.input);
            const files = Array.from(fileInput.files);

            for (let file of files) {
                await this.database.saveFile(file, reportId, fileInputInfo.type);
            }
        }
    }

    validateForm() {
        let isValid = true;
        const requiredFields = this.form.querySelectorAll('[required]');
        
        requiredFields.forEach(field => {
            const formGroup = field.closest('.form-group');
            this.clearFieldError(formGroup);

            if (!FormValidator.validateRequiredField(field.value)) {
                this.markFieldError(formGroup, 'Este campo es obligatorio');
                isValid = false;
            }
        });

        // Validate file requirements
        const coberturaFiles = document.getElementById('pruebasCobertura').files;
        const servicioFiles = document.getElementById('pruebasFaltaServicio').files;

        if (coberturaFiles.length === 0) {
            const formGroup = document.getElementById('pruebasCobertura').closest('.form-group');
            this.markFieldError(formGroup, 'Debes subir al menos un archivo de prueba de cobertura');
            isValid = false;
        }

        if (servicioFiles.length === 0) {
            const formGroup = document.getElementById('pruebasFaltaServicio').closest('.form-group');
            this.markFieldError(formGroup, 'Debes subir al menos un archivo de prueba de falta de servicio');
            isValid = false;
        }

        // Validate checkboxes
        const operadoresConsultados = this.form.querySelectorAll('input[name="operadoresConsultados"]:checked');
        if (operadoresConsultados.length === 0) {
            const checkboxGroup = this.form.querySelector('input[name="operadoresConsultados"]').closest('.form-group');
            this.markFieldError(checkboxGroup, 'Debes seleccionar al menos un operador consultado');
            isValid = false;
        }

        const metodosContacto = this.form.querySelectorAll('input[name="metodosContacto"]:checked');
        if (metodosContacto.length === 0) {
            const checkboxGroup = this.form.querySelector('input[name="metodosContacto"]').closest('.form-group');
            this.markFieldError(checkboxGroup, 'Debes seleccionar al menos un método de contacto');
            isValid = false;
        }

        return isValid;
    }

    markFieldError(formGroup, message) {
        formGroup.classList.remove('success');
        formGroup.classList.add('error');
        
        let errorElement = formGroup.querySelector('.error-text');
        if (!errorElement) {
            errorElement = document.createElement('span');
            errorElement.className = 'error-text';
            formGroup.appendChild(errorElement);
        }
        errorElement.textContent = message;
    }

    markFieldSuccess(formGroup) {
        formGroup.classList.remove('error');
        formGroup.classList.add('success');
        this.clearFieldError(formGroup);
    }

    clearFieldError(formGroup) {
        const errorElement = formGroup.querySelector('.error-text');
        if (errorElement) {
            errorElement.remove();
        }
    }

    clearAllFieldStates() {
        const formGroups = this.form.querySelectorAll('.form-group');
        formGroups.forEach(group => {
            group.classList.remove('error', 'success');
            this.clearFieldError(group);
        });
    }

    setFormLoading(loading) {
        if (loading) {
            this.form.classList.add('form-loading');
            const submitBtn = this.form.querySelector('.submit-btn');
            submitBtn.textContent = '⏳ Enviando...';
            submitBtn.disabled = true;
        } else {
            this.form.classList.remove('form-loading');
            const submitBtn = this.form.querySelector('.submit-btn');
            submitBtn.textContent = '📤 Enviar Denuncia';
            submitBtn.disabled = false;
        }
    }

    showMessage(message, type) {
        // Remove existing messages
        const existingMessages = document.querySelectorAll('.success-message, .error-message');
        existingMessages.forEach(msg => msg.remove());

        // Create new message
        const messageDiv = document.createElement('div');
        messageDiv.className = type === 'success' ? 'success-message' : 'error-message';
        messageDiv.textContent = message;
        messageDiv.style.display = 'block';

        // Insert before form
        this.form.parentNode.insertBefore(messageDiv, this.form);

        // Auto-hide after 5 seconds
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.remove();
            }
        }, 5000);

        // Scroll to message
        messageDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    addExportButton() {
        const exportBtn = document.createElement('button');
        exportBtn.type = 'button';
        exportBtn.className = 'submit-btn';
        exportBtn.style.marginTop = '1rem';
        exportBtn.style.background = 'linear-gradient(135deg, #3498db, #2980b9)';
        exportBtn.textContent = '📊 Exportar Datos de la Base de Datos';
        exportBtn.addEventListener('click', () => this.exportData());

        // Add to footer
        const footer = document.querySelector('footer .container');
        footer.appendChild(exportBtn);
    }

    async exportData() {
        try {
            const success = await this.database.exportData();
            if (success) {
                this.showMessage('Datos exportados exitosamente', 'success');
            } else {
                this.showMessage('Error al exportar los datos', 'error');
            }
        } catch (error) {
            console.error('Export error:', error);
            this.showMessage('Error al exportar los datos', 'error');
        }
    }

    showExportOption() {
        if (confirm('¿Deseas exportar todos los datos de la base de datos como respaldo?')) {
            this.exportData();
        }
    }
}

// Initialize application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new FraudReportApp();
});

// Add some utility functions for data analysis
window.FraudAnalytics = {
    async getStatistics() {
        const app = new FraudDatabase();
        await app.initDB();
        
        const reports = await app.getAllReports();
        
        return {
            totalReports: reports.length,
            operatorBreakdown: this.getOperatorBreakdown(reports),
            monthlyTrends: this.getMonthlyTrends(reports),
            averageResponseTime: this.getAverageResponseTime(reports)
        };
    },

    getOperatorBreakdown(reports) {
        const breakdown = {};
        reports.forEach(report => {
            const operator = report.operadorDeclarante || 'Unknown';
            breakdown[operator] = (breakdown[operator] || 0) + 1;
        });
        return breakdown;
    },

    getMonthlyTrends(reports) {
        const trends = {};
        reports.forEach(report => {
            const month = new Date(report.fechaCreacion).toISOString().substring(0, 7);
            trends[month] = (trends[month] || 0) + 1;
        });
        return trends;
    },

    getAverageResponseTime(reports) {
        // This would be calculated based on resolution times when implemented
        return "Pendiente de implementación";
    }
};