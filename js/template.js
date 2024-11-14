class TemplateManager {
    constructor() {
      this.templates = [];
      this.currentTemplate = null;
      this.initializeUI();
      this.loadTemplates();
    }
  
    async initializeUI() {
      // UI Elements
      this.templatesList = document.getElementById('templatesList');
      this.templateName = document.getElementById('templateName');
      this.templateCategory = document.getElementById('templateCategory');
      this.roleDefinition = document.getElementById('roleDefinition');
      this.context = document.getElementById('context');
      this.skillsList = document.getElementById('skillsList');
      this.outputFormat = document.getElementById('outputFormat');
      this.examples = document.getElementById('examples');
      this.previewModal = document.getElementById('previewModal');
      
      // Buttons
      document.getElementById('newTemplate').addEventListener('click', () => this.createNewTemplate());
      document.getElementById('importTemplate').addEventListener('click', () => this.importTemplate());
      document.getElementById('exportTemplate').addEventListener('click', () => this.exportTemplate());
      document.getElementById('previewTemplate').addEventListener('click', () => this.showPreview());
      document.getElementById('saveTemplate').addEventListener('click', () => this.saveTemplate());
      document.getElementById('copyPreview').addEventListener('click', () => this.copyToClipboard());
      
      // Search
      document.getElementById('templateSearch').addEventListener('input', (e) => this.filterTemplates(e.target.value));
    }
  
    async loadTemplates() {
      const result = await chrome.storage.sync.get('langGPTTemplates');
      this.templates = result.langGPTTemplates || this.getDefaultTemplates();
      this.renderTemplatesList();
    }
  
    getDefaultTemplates() {
      return [
        {
          id: 'default-1',
          name: 'General Expert',
          category: 'General',
          roleDefinition: 'You are an expert in {field} specializing in {specialty}.',
          context: 'Background: {context}\nScope: {scope}',
          skills: ['Analysis', 'Problem Solving', 'Communication'],
          outputFormat: 'Format your response in the following structure:\n1. Analysis\n2. Solution\n3. Recommendations',
          examples: 'Input: {example_input}\nOutput: {example_output}'
        },
        {
          id: 'default-2',
          name: 'Technical Consultant',
          category: 'Technical',
          roleDefinition: 'You are a technical consultant with expertise in {technology}.',
          context: 'Project Background: {project}\nRequirements: {requirements}',
          skills: ['Technical Analysis', 'Solution Design', 'Best Practices'],
          outputFormat: '1. Technical Assessment\n2. Proposed Solution\n3. Implementation Steps\n4. Considerations',
          examples: 'Example Request: {request}\nExample Response: {response}'
        }
      ];
    }
  
    renderTemplatesList() {
      this.templatesList.innerHTML = this.templates.map(template => `
        <div class="template-item" data-id="${template.id}">
          <h3>${template.name}</h3>
          <p>${template.category}</p>
        </div>
      `).join('');
  
      // Add click handlers
      this.templatesList.querySelectorAll('.template-item').forEach(item => {
        item.addEventListener('click', () => this.loadTemplate(item.dataset.id));
      });
    }
  
    async loadTemplate(templateId) {
      this.currentTemplate = this.templates.find(t => t.id === templateId);
      if (!this.currentTemplate) return;
  
      this.templateName.value = this.currentTemplate.name;
      this.templateCategory.value = this.currentTemplate.category;
      this.roleDefinition.value = this.currentTemplate.roleDefinition;
      this.context.value = this.currentTemplate.context;
      this.outputFormat.value = this.currentTemplate.outputFormat;
      this.examples.value = this.currentTemplate.examples;
  
      // Render skills
      this.renderSkills(this.currentTemplate.skills);
    }
  
    renderSkills(skills) {
      this.skillsList.innerHTML = skills.map(skill => `
        <div class="skill-item">
          <input type="text" value="${skill}">
          <button class="remove-skill">-</button>
        </div>
      `).join('') + `
        <div class="skill-item">
          <input type="text" placeholder="Add skill...">
          <button class="add-skill">+</button>
        </div>
      `;
  
      // Add event listeners for skill buttons
      this.skillsList.querySelectorAll('.add-skill').forEach(btn => {
        btn.addEventListener('click', (e) => this.addSkill(e));
      });
  
      this.skillsList.querySelectorAll('.remove-skill').forEach(btn => {
        btn.addEventListener('click', (e) => this.removeSkill(e));
      });
    }
  
    addSkill(event) {
      const skillInput = event.target.previousElementSibling;
      const skill = skillInput.value.trim();
      if (!skill) return;
  
      const newSkillItem = document.createElement('div');
      newSkillItem.className = 'skill-item';
      newSkillItem.innerHTML = `
        <input type="text" value="${skill}">
        <button class="remove-skill">-</button>
      `;
  
      const addSkillItem = event.target.parentElement;
      this.skillsList.insertBefore(newSkillItem, addSkillItem);
      skillInput.value = '';
  
      // Add event listener to new remove button
      newSkillItem.querySelector('.remove-skill').addEventListener('click', (e) => this.removeSkill(e));
    }
  
    removeSkill(event) {
      event.target.parentElement.remove();
    }
  
    async saveTemplate() {
      const template = {
        id: this.currentTemplate?.id || `template-${Date.now()}`,
        name: this.templateName.value,
        category: this.templateCategory.value,
        roleDefinition: this.roleDefinition.value,
        context: this.context.value,
        skills: Array.from(this.skillsList.querySelectorAll('.skill-item input'))
          .map(input => input.value.trim())
          .filter(skill => skill && skill !== 'Add skill...'),
        outputFormat: this.outputFormat.value,
        examples: this.examples.value
      };
  
      if (this.currentTemplate) {
        const index = this.templates.findIndex(t => t.id === template.id);
        this.templates[index] = template;
      } else {
        this.templates.push(template);
      }
  
      await this.saveToStorage();
      this.renderTemplatesList();
    }
  
    async saveToStorage() {
      await chrome.storage.sync.set({ langGPTTemplates: this.templates });
    }
  
    createNewTemplate() {
      this.currentTemplate = null;
      this.templateName.value = '';
      this.templateCategory.value = '';
      this.roleDefinition.value = '';
      this.context.value = '';
      this.outputFormat.value = '';
      this.examples.value = '';
      this.renderSkills([]);
    }
  
    generatePrompt() {
      return `# Role
  ${this.roleDefinition.value}
  
  # Context
  ${this.context.value}
  
  # Skills Required
  ${this.getSkills().map(skill => `- ${skill}`).join('\n')}
  
  # Output Format
  ${this.outputFormat.value}
  
  # Examples
  ${this.examples.value}`;
    }
  
    showPreview() {
      const previewContent = document.getElementById('previewContent');
      previewContent.textContent = this.generatePrompt();
      this.previewModal.style.display = 'block';
    }
  
    async copyToClipboard() {
      const content = this.generatePrompt();
      await navigator.clipboard.writeText(content);
      alert('Copied to clipboard!');
    }
  
    filterTemplates(searchTerm) {
      const filtered = this.templates.filter(template => 
        template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        template.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
      this.renderTemplatesList(filtered);
    }
  
    async importTemplate() {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.json';
      
      input.onchange = async (e) => {
        const file = e.target.files[0];
        const reader = new FileReader();
        
        reader.onload = async (event) => {
          try {
            const templates = JSON.parse(event.target.result);
            this.templates = [...this.templates, ...templates];
            await this.saveToStorage();
            this.renderTemplatesList();
          } catch (error) {
            alert('Error importing templates: ' + error.message);
          }
        };
        
        reader.readAsText(file);
      };
      
      input.click();
    }
  
    async exportTemplate() {
      const content = JSON.stringify(this.templates, null, 2);
      const blob = new Blob([content], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = 'langGPT-templates.json';
      a.click();
      
      URL.revokeObjectURL(url);
    }
  
    getSkills() {
      return Array.from(this.skillsList.querySelectorAll('.skill-item input'))
        .map(input => input.value.trim())
        .filter(skill => skill && skill !== 'Add skill...');
    }
  }
  
  // Initialize the template manager
  document.addEventListener('DOMContentLoaded', () => {
    new TemplateManager();
  });