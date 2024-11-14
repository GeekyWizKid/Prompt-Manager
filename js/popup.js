document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const addNewBtn = document.getElementById('addNew');
    const promptsList = document.getElementById('promptsList');
    const promptModal = document.getElementById('promptModal');
    const promptForm = document.getElementById('promptForm');
    const savePromptBtn = document.getElementById('savePrompt');
    const cancelPromptBtn = document.getElementById('cancelPrompt');
    const contentTextarea = document.getElementById('promptContent');
    
    let prompts = [];
    let editingPromptId = null;
  
    // Auto resize textarea
    const autoResizeTextarea = (textarea) => {
      textarea.style.height = 'auto';
      textarea.style.height = (textarea.scrollHeight) + 'px';
    };
  
    // Add resize listener to textarea
    contentTextarea.addEventListener('input', (e) => {
      autoResizeTextarea(e.target);
    });
  
    // Load prompts from storage
    const loadPrompts = async () => {
      try {
        const result = await chrome.storage.sync.get('prompts');
        prompts = result.prompts || [];
        renderPromptsList();
      } catch (error) {
        console.error('Error loading prompts:', error);
      }
    };
  
    // Save prompts to storage
    const savePrompts = async () => {
      try {
        await chrome.storage.sync.set({ prompts });
        renderPromptsList();
      } catch (error) {
        console.error('Error saving prompts:', error);
      }
    };
  
    // Copy prompt content
    const copyPromptContent = async (promptId) => {
      const prompt = prompts.find(p => p.id === promptId);
      if (prompt) {
        try {
          await navigator.clipboard.writeText(prompt.content);
          // Show feedback
          const item = document.querySelector(`[data-id="${promptId}"]`);
          const originalBackground = item.style.backgroundColor;
          item.style.backgroundColor = '#e8f0fe';
          setTimeout(() => {
            item.style.backgroundColor = originalBackground;
          }, 200);
        } catch (error) {
          console.error('Failed to copy:', error);
        }
      }
    };
  
    // Render prompts list
    const renderPromptsList = () => {
      promptsList.innerHTML = prompts.map(prompt => `
        <div class="prompt-item" data-id="${prompt.id}">
          <div class="prompt-content">
            <h3>${prompt.title}</h3>
            <p>${prompt.category || 'Uncategorized'}</p>
          </div>
          <div class="prompt-actions">
            <button class="action-button edit-button" data-action="edit" title="Edit">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
            </button>
            <button class="action-button delete-button" data-action="delete" title="Delete">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 6h18"></path>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
            </button>
          </div>
        </div>
      `).join('') || '<p class="no-prompts">No prompts yet. Click "New Prompt" to add one.</p>';
  
      // Add event listeners to prompt items
      document.querySelectorAll('.prompt-item').forEach(item => {
        // Double click to copy
        item.addEventListener('dblclick', () => copyPromptContent(item.dataset.id));
        
        // Action buttons
        item.querySelectorAll('.action-button').forEach(button => {
          button.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent double click from triggering
            const action = button.dataset.action;
            const promptId = button.closest('.prompt-item').dataset.id;
            
            if (action === 'edit') {
              editPrompt(promptId);
            } else if (action === 'delete') {
              deletePrompt(promptId);
            }
          });
        });
      });
    };
  
    // Delete prompt
    const deletePrompt = async (promptId) => {
      if (confirm('Are you sure you want to delete this prompt?')) {
        prompts = prompts.filter(p => p.id !== promptId);
        await savePrompts();
      }
    };
  
    // Show modal
    const showModal = () => {
      promptModal.style.display = 'block';
      // Reset textarea height
      autoResizeTextarea(contentTextarea);
    };
  
    // Hide modal
    const hideModal = () => {
      promptModal.style.display = 'none';
      editingPromptId = null;
      promptForm.reset();
      contentTextarea.style.height = 'auto';
    };
  
    // Add new prompt
    const addNewPrompt = () => {
      editingPromptId = null;
      promptForm.reset();
      showModal();
    };
  
    // Edit existing prompt
    const editPrompt = (promptId) => {
      const prompt = prompts.find(p => p.id === promptId);
      if (prompt) {
        editingPromptId = promptId;
        document.getElementById('promptTitle').value = prompt.title;
        document.getElementById('promptCategory').value = prompt.category || '';
        contentTextarea.value = prompt.content;
        showModal();
        autoResizeTextarea(contentTextarea);
      }
    };
  
    // Save prompt
    const savePrompt = async (e) => {
      e.preventDefault();
  
      const title = document.getElementById('promptTitle').value.trim();
      const category = document.getElementById('promptCategory').value.trim();
      const content = contentTextarea.value.trim();
  
      if (!title || !content) return;
  
      const prompt = {
        id: editingPromptId || Date.now().toString(),
        title,
        category,
        content,
        updated: new Date().toISOString()
      };
  
      if (editingPromptId) {
        const index = prompts.findIndex(p => p.id === editingPromptId);
        prompts[index] = prompt;
      } else {
        prompts.push(prompt);
      }
  
      await savePrompts();
      hideModal();
    };
  
    // Event listeners
    addNewBtn.addEventListener('click', addNewPrompt);
    cancelPromptBtn.addEventListener('click', hideModal);
    promptForm.addEventListener('submit', savePrompt);
  
    // Close modal when clicking outside
    promptModal.addEventListener('click', (e) => {
      if (e.target === promptModal) {
        hideModal();
      }
    });
  
    // Initialize
    loadPrompts();
  });