// Queen Mary University Research Study Flow Control
// GPT-5 Design Implementation for Music Therapy Experiment

// 获取API基础URL
const API_BASE = (window.EXPERIMENT_CONFIG && window.EXPERIMENT_CONFIG.apiBaseUrl) || "";

class StudyFlowManager {
    constructor() {
        this.currentStep = this.getCurrentStep();
        this.participantData = this.loadParticipantData();
        // 不在构造函数中调用initializeFlow，等DOM准备好后再调用
    }

    // Step Management
    getCurrentStep() {
        return localStorage.getItem('qmul_study_step') || 'portal';
    }

    setCurrentStep(step) {
        this.currentStep = step;
        localStorage.setItem('qmul_study_step', step);
    }

    // Data Management
    loadParticipantData() {
        const data = localStorage.getItem('qmul_participant_data');
        return data ? JSON.parse(data) : {
            sessionId: this.generateSessionId(),
            startTime: new Date().toISOString(),
            participantInfo: {},
            consentData: {},
            therapyData: {},
            questionnaireData: {},
            completed: false
        };
    }

    saveParticipantData() {
        localStorage.setItem('qmul_participant_data', JSON.stringify(this.participantData));
    }

    generateSessionId() {
        return 'QMUL_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    // Flow Control
    initializeFlow() {
        this.updateProgressIndicators();
        this.setupEventListeners();
    }

    canProceedToStep(targetStep) {
        const stepOrder = ['portal', 'participant_info', 'consent_form', 'therapy', 'questionnaire', 'thank_you'];
        const currentIndex = stepOrder.indexOf(this.currentStep);
        const targetIndex = stepOrder.indexOf(targetStep);
        
        // Can only proceed to next step or stay on current
        return targetIndex <= currentIndex + 1;
    }

    proceedToStep(targetStep) {
        if (!this.canProceedToStep(targetStep)) {
            this.showAlert('请按顺序完成所有步骤 / Please complete all steps in order', 'warning');
            return false;
        }
        
        this.setCurrentStep(targetStep);
        this.navigateToPage(targetStep);
        return true;
    }

    navigateToPage(step) {
        const pageMap = {
            'portal': 'experiment_portal.html',
            'participant_info': 'participant_info.html',
            'consent_form': 'consent_form.html',
            'therapy': 'therapy_interface_bilingual.html?from=experiment',
            'questionnaire': 'questionnaire.html',
            'thank_you': 'thank_you.html'
        };
        
        if (pageMap[step]) {
            window.location.href = pageMap[step];
        }
    }

    // Progress Indicators
    updateProgressIndicators() {
        const steps = document.querySelectorAll('.progress-steps .step');
        const stepOrder = ['portal', 'participant_info', 'consent_form', 'therapy', 'questionnaire', 'thank_you'];
        const currentIndex = stepOrder.indexOf(this.currentStep);
        
        steps.forEach((step, index) => {
            step.classList.remove('completed', 'current', 'pending');
            
            if (index < currentIndex) {
                step.classList.add('completed');
            } else if (index === currentIndex) {
                step.classList.add('current');
            } else {
                step.classList.add('pending');
            }
        });
    }

    // Event Listeners
    setupEventListeners() {
        // Form submission handlers
        const forms = document.querySelectorAll('form[data-study-form]');
        forms.forEach(form => {
            form.addEventListener('submit', (e) => this.handleFormSubmission(e));
        });
        
        // Navigation button handlers
        const navButtons = document.querySelectorAll('[data-navigate-to]');
        navButtons.forEach(button => {
            button.addEventListener('click', (e) => this.handleNavigation(e));
        });
        
        // Consent checkbox handlers
        const consentCheckboxes = document.querySelectorAll('.consent-checkbox');
        consentCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('change', () => this.updateConsentStatus());
        });
    }

    // Form Handling
    handleFormSubmission(event) {
        event.preventDefault();
        const form = event.target;
        const formType = form.dataset.studyForm;
        
        if (!this.validateForm(form)) {
            return;
        }
        
        const formData = this.collectFormData(form);
        this.saveFormData(formType, formData);
        
        // Proceed to next step
        const nextStep = this.getNextStep(formType);
        if (nextStep) {
            this.proceedToStep(nextStep);
        }
    }

    validateForm(form) {
        const requiredFields = form.querySelectorAll('[required]');
        let isValid = true;
        
        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                this.highlightError(field);
                isValid = false;
            } else {
                this.clearError(field);
            }
        });
        
        // Special validation for consent form
        if (form.dataset.studyForm === 'consent') {
            const consentCheckboxes = form.querySelectorAll('.consent-checkbox');
            const allChecked = Array.from(consentCheckboxes).every(cb => cb.checked);
            
            if (!allChecked) {
                this.showAlert('请阅读并同意所有条款才能继续 / Please read and agree to all terms to continue', 'warning');
                isValid = false;
            }
        }
        
        return isValid;
    }

    collectFormData(form) {
        const data = {};
        const formData = new FormData(form);
        
        for (let [key, value] of formData.entries()) {
            if (data[key]) {
                // Handle multiple values (checkboxes, etc.)
                if (Array.isArray(data[key])) {
                    data[key].push(value);
                } else {
                    data[key] = [data[key], value];
                }
            } else {
                data[key] = value;
            }
        }
        
        return data;
    }

    saveFormData(formType, formData) {
        switch (formType) {
            case 'participant_info':
                this.participantData.participantInfo = formData;
                break;
            case 'consent':
                this.participantData.consentData = {
                    ...formData,
                    timestamp: new Date().toISOString()
                };
                break;
            case 'questionnaire':
                this.participantData.questionnaireData = {
                    ...formData,
                    timestamp: new Date().toISOString()
                };
                this.participantData.completed = true;
                this.participantData.endTime = new Date().toISOString();
                
                // 自动提交数据到服务器
                setTimeout(() => {
                    this.submitDataToServer();
                }, 1000);
                break;
        }
        
        this.saveParticipantData();
    }

    getNextStep(formType) {
        const stepMap = {
            'participant_info': 'consent_form',
            'consent': 'therapy',
            'questionnaire': 'thank_you'
        };
        
        return stepMap[formType];
    }

    // Navigation Handling
    handleNavigation(event) {
        event.preventDefault();
        const button = event.target;
        const targetStep = button.dataset.navigateTo;
        
        if (targetStep) {
            this.proceedToStep(targetStep);
        }
    }

    // Consent Management
    updateConsentStatus() {
        const consentCheckboxes = document.querySelectorAll('.consent-checkbox');
        const submitButton = document.querySelector('.consent-submit');
        const allChecked = Array.from(consentCheckboxes).every(cb => cb.checked);
        
        if (submitButton) {
            submitButton.disabled = !allChecked;
        }
        
        // Update visual feedback
        consentCheckboxes.forEach(checkbox => {
            const item = checkbox.closest('.checkbox-item');
            if (item) {
                item.classList.toggle('checked', checkbox.checked);
            }
        });
    }

    // Therapy Integration
    integrateWithTherapySystem() {
        // This method will be called from the therapy interface
        // to mark therapy completion and proceed to questionnaire
        this.participantData.therapyData = {
            completed: true,
            timestamp: new Date().toISOString(),
            sessionId: this.participantData.sessionId
        };
        
        this.saveParticipantData();
        this.setCurrentStep('questionnaire');
    }

    // UI Helpers
    showAlert(message, type = 'info') {
        // Remove existing alerts
        const existingAlerts = document.querySelectorAll('.alert');
        existingAlerts.forEach(alert => alert.remove());
        
        // Create new alert
        const alert = document.createElement('div');
        alert.className = `alert alert-${type}`;
        alert.textContent = message;
        
        // Insert at top of content
        const container = document.querySelector('.container');
        if (container) {
            container.insertBefore(alert, container.firstChild);
        }
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (alert.parentNode) {
                alert.remove();
            }
        }, 5000);
    }

    highlightError(field) {
        field.style.borderColor = '#dc3545';
        field.classList.add('error');
        
        // Show error message
        let errorMsg = field.parentNode.querySelector('.error-message');
        if (!errorMsg) {
            errorMsg = document.createElement('small');
            errorMsg.className = 'error-message';
            errorMsg.style.color = '#dc3545';
            field.parentNode.appendChild(errorMsg);
        }
        errorMsg.textContent = '此字段为必填项 / This field is required';
    }

    clearError(field) {
        field.style.borderColor = '';
        field.classList.remove('error');
        
        const errorMsg = field.parentNode.querySelector('.error-message');
        if (errorMsg) {
            errorMsg.remove();
        }
    }

    // Data Export and Submission
    async submitDataToServer() {
        const exportData = this.prepareExportData();
        
        // 使用配置的API基础URL
        const apiUrl = `${API_BASE}/submit`;
        
        const controller = new AbortController();
        const t = setTimeout(() => controller.abort(), 15000);
        
        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(exportData),
                mode: 'cors',
                signal: controller.signal
            });
            
            clearTimeout(t);
            
            if (!response.ok) {
                const errorText = await response.text().catch(() => '');
                console.error('Submit failed', response.status, errorText);
                throw new Error(`Submit failed: ${response.status}`);
            }
            
            const result = await response.json();
            
            console.log('数据已成功提交到服务器:', result);
            this.showAlert('数据已安全提交 / Data submitted securely', 'success');
            return true;
            
        } catch (error) {
            clearTimeout(t);
            console.error('Network/timeout error during submit', error);
            this.showAlert(`无法连接服务器: ${error.message} / Server unavailable: ${error.message}`, 'warning');
            return false;
        }
    }
    
    prepareExportData() {
        // Anonymize data before export
        return {
            sessionId: this.participantData.sessionId,
            startTime: this.participantData.startTime,
            endTime: this.participantData.endTime,
            completed: this.participantData.completed,
            participantInfo: {
                ageGroup: this.participantData.participantInfo?.ageGroup,
                gender: this.participantData.participantInfo?.gender,
                digitalHealthExperience: this.participantData.participantInfo?.digitalHealthExperience,
                // Exclude personally identifiable information
            },
            consentGiven: !!this.participantData.consentData?.timestamp,
            consentTimestamp: this.participantData.consentData?.timestamp,
            therapyCompleted: !!this.participantData.therapyData?.completed,
            therapyTimestamp: this.participantData.therapyData?.timestamp,
            questionnaireData: this.participantData.questionnaireData,
            studyVersion: 'v1.0',
            browserInfo: {
                userAgent: navigator.userAgent,
                language: navigator.language,
                platform: navigator.platform
            }
        };
    }

    exportParticipantData() {
        const exportData = this.prepareExportData();
        
        // Create downloadable file
        const dataStr = JSON.stringify(exportData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `QMUL_Study_${this.participantData.sessionId}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        // 同时尝试提交到服务器
        this.submitDataToServer();
    }

    // Cleanup
    resetStudy() {
        localStorage.removeItem('qmul_study_step');
        localStorage.removeItem('qmul_participant_data');
        this.currentStep = 'portal';
        this.participantData = this.loadParticipantData();
    }
}

// Global instance
const studyFlow = new StudyFlowManager();
window.studyFlow = studyFlow;

// Global helper functions
function proceedToStep(step) {
    return studyFlow.proceedToStep(step);
}

function markTherapyComplete() {
    studyFlow.integrateWithTherapySystem();
}

function exportData() {
    studyFlow.exportParticipantData();
}

function resetStudy() {
    if (confirm('确定要重置整个研究流程吗？这将删除所有数据。\nAre you sure you want to reset the entire study flow? This will delete all data.')) {
        studyFlow.resetStudy();
        window.location.href = 'experiment_portal.html';
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    studyFlow.initializeFlow();
});

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { StudyFlowManager, studyFlow };
}