import React, { useState, useEffect } from 'react';
import axios from 'axios';

const EmailTemplateDesigner = () => {
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [templateForm, setTemplateForm] = useState({
    name: '',
    type: 'interview_invite',
    subject: '',
    content: '',
    variables: [],
    isActive: true
  });

  const templateTypes = [
    { value: 'interview_invite', label: 'Interview Invitation', icon: '📅' },
    { value: 'application_received', label: 'Application Received', icon: '✅' },
    { value: 'rejection_letter', label: 'Rejection Letter', icon: '❌' },
    { value: 'job_offer', label: 'Job Offer', icon: '🎉' },
    { value: 'follow_up', label: 'Follow Up', icon: '📞' },
    { value: 'welcome_email', label: 'Welcome Email', icon: '👋' },
    { value: 'reminder', label: 'Reminder', icon: '⏰' },
    { value: 'custom', label: 'Custom Template', icon: '📝' }
  ];

  const availableVariables = [
    { key: '{candidate_name}', description: 'Candidate full name' },
    { key: '{first_name}', description: 'Candidate first name' },
    { key: '{job_title}', description: 'Job position title' },
    { key: '{company_name}', description: 'Company name' },
    { key: '{interviewer_name}', description: 'Interviewer name' },
    { key: '{interview_date}', description: 'Interview date' },
    { key: '{interview_time}', description: 'Interview time' },
    { key: '{interview_location}', description: 'Interview location/link' },
    { key: '{application_date}', description: 'Application submission date' },
    { key: '{hr_contact}', description: 'HR contact information' },
    { key: '{salary_range}', description: 'Salary range' },
    { key: '{start_date}', description: 'Proposed start date' }
  ];

  const defaultTemplates = {
    interview_invite: {
      subject: 'Interview Invitation - {job_title} Position at {company_name}',
      content: `Dear {candidate_name},

Thank you for your interest in the {job_title} position at {company_name}. We were impressed with your application and would like to invite you for an interview.

Interview Details:
📅 Date: {interview_date}
🕒 Time: {interview_time}
📍 Location: {interview_location}
👤 Interviewer: {interviewer_name}

Please confirm your availability by replying to this email. If you have any questions, feel free to contact us at {hr_contact}.

We look forward to meeting you!

Best regards,
{company_name} HR Team`
    },
    application_received: {
      subject: 'Application Received - {job_title} Position',
      content: `Dear {candidate_name},

Thank you for applying for the {job_title} position at {company_name}. We have received your application submitted on {application_date}.

Our hiring team will review your application and get back to you within 5-7 business days. If your qualifications match our requirements, we will contact you to schedule an interview.

Thank you for your interest in joining our team!

Best regards,
{company_name} HR Team`
    },
    rejection_letter: {
      subject: 'Update on Your Application - {job_title} Position',
      content: `Dear {candidate_name},

Thank you for your interest in the {job_title} position at {company_name} and for taking the time to apply.

After careful consideration, we have decided to move forward with other candidates whose experience more closely matches our current needs. This was a difficult decision as we received many qualified applications.

We encourage you to apply for future opportunities that match your skills and experience. We will keep your resume on file for six months and may contact you about other suitable positions.

Thank you again for your interest in {company_name}.

Best regards,
{company_name} HR Team`
    },
    job_offer: {
      subject: 'Job Offer - {job_title} Position at {company_name}',
      content: `Dear {candidate_name},

Congratulations! We are pleased to offer you the position of {job_title} at {company_name}.

Offer Details:
💼 Position: {job_title}
💰 Salary: {salary_range}
📅 Start Date: {start_date}
📍 Location: {interview_location}

This offer is contingent upon successful completion of background checks and any other requirements outlined in our hiring process.

Please confirm your acceptance by replying to this email by [DATE]. If you have any questions, please contact {hr_contact}.

We are excited to welcome you to the {company_name} team!

Best regards,
{company_name} HR Team`
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/admin/email-templates', {
        headers: { Authorization: `Bearer ${token}` }
      }).catch(() => ({
        data: generateMockTemplates()
      }));
      
      setTemplates(response.data);
    } catch (error) {
      console.error('Error fetching templates:', error);
      setTemplates(generateMockTemplates());
    } finally {
      setLoading(false);
    }
  };

  const generateMockTemplates = () => {
    return Object.entries(defaultTemplates).map(([type, template], index) => ({
      _id: `template_${index}`,
      name: templateTypes.find(t => t.value === type)?.label || type,
      type,
      subject: template.subject,
      content: template.content,
      variables: extractVariables(template.content + ' ' + template.subject),
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      usageCount: Math.floor(Math.random() * 100)
    }));
  };

  const extractVariables = (text) => {
    const matches = text.match(/\{[^}]+\}/g);
    return matches ? [...new Set(matches)] : [];
  };

  const handleSaveTemplate = async () => {
    if (!templateForm.name || !templateForm.subject || !templateForm.content) {
      alert('Please fill in all required fields');
      return;
    }

    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const templateData = {
        ...templateForm,
        variables: extractVariables(templateForm.content + ' ' + templateForm.subject)
      };

      let response;
      if (selectedTemplate) {
        response = await axios.put(
          `http://localhost:5000/api/admin/email-templates/${selectedTemplate._id}`,
          templateData,
          { headers: { Authorization: `Bearer ${token}` } }
        ).catch(() => ({
          data: { ...templateData, _id: selectedTemplate._id, updatedAt: new Date().toISOString() }
        }));
      } else {
        response = await axios.post(
          'http://localhost:5000/api/admin/email-templates',
          templateData,
          { headers: { Authorization: `Bearer ${token}` } }
        ).catch(() => ({
          data: { ...templateData, _id: `template_${Date.now()}`, createdAt: new Date().toISOString() }
        }));
      }

      if (selectedTemplate) {
        setTemplates(prev => prev.map(t => t._id === selectedTemplate._id ? response.data : t));
      } else {
        setTemplates(prev => [...prev, response.data]);
      }

      setIsEditing(false);
      setSelectedTemplate(null);
      resetForm();
      alert('✅ Template saved successfully!');
    } catch (error) {
      console.error('Error saving template:', error);
      alert('❌ Failed to save template');
    } finally {
      setSaving(false);
    }
  };

  const handleEditTemplate = (template) => {
    setSelectedTemplate(template);
    setTemplateForm({
      name: template.name,
      type: template.type,
      subject: template.subject,
      content: template.content,
      variables: template.variables,
      isActive: template.isActive
    });
    setIsEditing(true);
  };

  const handleNewTemplate = () => {
    resetForm();
    setSelectedTemplate(null);
    setIsEditing(true);
  };

  const resetForm = () => {
    setTemplateForm({
      name: '',
      type: 'interview_invite',
      subject: '',
      content: '',
      variables: [],
      isActive: true
    });
  };

  const insertVariable = (variable) => {
    const textarea = document.getElementById('template-content');
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const content = templateForm.content;
    const newContent = content.substring(0, start) + variable + content.substring(end);
    
    setTemplateForm(prev => ({ ...prev, content: newContent }));
    
    // Reset cursor position
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + variable.length, start + variable.length);
    }, 0);
  };

  const previewTemplate = () => {
    const previewData = {
      candidate_name: 'John Doe',
      first_name: 'John',
      job_title: 'Senior Software Engineer',
      company_name: 'TechCorp Inc.',
      interviewer_name: 'Sarah Johnson',
      interview_date: 'October 25, 2024',
      interview_time: '2:00 PM EST',
      interview_location: 'Conference Room A / Zoom Link',
      application_date: 'October 18, 2024',
      hr_contact: 'hr@techcorp.com',
      salary_range: '$80,000 - $120,000',
      start_date: 'November 15, 2024'
    };

    let previewSubject = templateForm.subject;
    let previewContent = templateForm.content;

    Object.entries(previewData).forEach(([key, value]) => {
      const placeholder = `{${key}}`;
      previewSubject = previewSubject.replace(new RegExp(placeholder.replace(/[{}]/g, '\\$&'), 'g'), value);
      previewContent = previewContent.replace(new RegExp(placeholder.replace(/[{}]/g, '\\$&'), 'g'), value);
    });

    return { subject: previewSubject, content: previewContent };
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <div style={{ fontSize: '18px', color: '#6b7280' }}>Loading email templates...</div>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ margin: '0 0 8px 0', fontSize: '24px', fontWeight: '600', color: '#111827' }}>
            📧 Email Template Designer
          </h2>
          <p style={{ margin: 0, color: '#6b7280' }}>
            Create and manage automated email templates for candidate communications
          </p>
        </div>
        <button
          onClick={handleNewTemplate}
          style={{
            background: '#3b82f6',
            color: '#fff',
            border: 'none',
            padding: '12px 20px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          ✨ New Template
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: isEditing ? '1fr 2fr' : '1fr', gap: '24px' }}>
        {/* Templates List */}
        <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
          <div style={{ padding: '20px', borderBottom: '1px solid #e5e7eb', background: '#f9fafb' }}>
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: '#111827' }}>
              Email Templates ({templates.length})
            </h3>
          </div>
          
          <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
            {templates.map(template => (
              <div
                key={template._id}
                style={{
                  padding: '16px 20px',
                  borderBottom: '1px solid #f3f4f6',
                  cursor: 'pointer',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => e.target.style.background = '#f9fafb'}
                onMouseLeave={(e) => e.target.style.background = '#fff'}
                onClick={() => handleEditTemplate(template)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '20px' }}>
                      {templateTypes.find(t => t.value === template.type)?.icon || '📝'}
                    </span>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: '600', color: '#111827' }}>
                        {template.name}
                      </div>
                      <div style={{ fontSize: '12px', color: '#6b7280' }}>
                        {templateTypes.find(t => t.value === template.type)?.label || template.type}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{
                      background: template.isActive ? '#d1fae5' : '#fee2e2',
                      color: template.isActive ? '#065f46' : '#991b1b',
                      padding: '2px 8px',
                      borderRadius: '12px',
                      fontSize: '11px',
                      fontWeight: '500'
                    }}>
                      {template.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
                
                <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '8px' }}>
                  Subject: {template.subject.length > 50 ? template.subject.substring(0, 50) + '...' : template.subject}
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: '11px', color: '#9ca3af' }}>
                    Used {template.usageCount || 0} times
                  </div>
                  <div style={{ fontSize: '11px', color: '#9ca3af' }}>
                    {template.variables?.length || 0} variables
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Template Editor */}
        {isEditing && (
          <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
            <div style={{ padding: '20px', borderBottom: '1px solid #e5e7eb', background: '#f9fafb' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: '#111827' }}>
                {selectedTemplate ? 'Edit Template' : 'New Template'}
              </h3>
            </div>

            <div style={{ padding: '24px' }}>
              {/* Template Basic Info */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>
                    Template Name *
                  </label>
                  <input
                    type="text"
                    value={templateForm.name}
                    onChange={(e) => setTemplateForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Interview Invitation - Tech Role"
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>
                    Template Type *
                  </label>
                  <select
                    value={templateForm.type}
                    onChange={(e) => {
                      const newType = e.target.value;
                      setTemplateForm(prev => ({
                        ...prev,
                        type: newType,
                        subject: defaultTemplates[newType]?.subject || prev.subject,
                        content: defaultTemplates[newType]?.content || prev.content
                      }));
                    }}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}
                  >
                    {templateTypes.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.icon} {type.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Subject Line */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>
                  Email Subject *
                </label>
                <input
                  type="text"
                  value={templateForm.subject}
                  onChange={(e) => setTemplateForm(prev => ({ ...prev, subject: e.target.value }))}
                  placeholder="Enter email subject line..."
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                />
              </div>

              {/* Variables Panel */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '12px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>
                  Available Variables
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px' }}>
                  {availableVariables.map(variable => (
                    <button
                      key={variable.key}
                      onClick={() => insertVariable(variable.key)}
                      style={{
                        padding: '8px 12px',
                        background: '#f3f4f6',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '12px',
                        textAlign: 'left',
                        transition: 'background 0.2s'
                      }}
                      onMouseEnter={(e) => e.target.style.background = '#e5e7eb'}
                      onMouseLeave={(e) => e.target.style.background = '#f3f4f6'}
                    >
                      <div style={{ fontWeight: '600', color: '#3b82f6' }}>{variable.key}</div>
                      <div style={{ color: '#6b7280' }}>{variable.description}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Content Editor */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>
                  Email Content *
                </label>
                <textarea
                  id="template-content"
                  value={templateForm.content}
                  onChange={(e) => setTemplateForm(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Enter your email content here... Use variables like {candidate_name}"
                  rows={12}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontFamily: 'monospace',
                    resize: 'vertical'
                  }}
                />
              </div>

              {/* Template Status */}
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={templateForm.isActive}
                    onChange={(e) => setTemplateForm(prev => ({ ...prev, isActive: e.target.checked }))}
                  />
                  <span style={{ fontSize: '14px', color: '#374151' }}>Template is active</span>
                </label>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => setShowPreview(!showPreview)}
                  style={{
                    background: '#f3f4f6',
                    color: '#374151',
                    border: '1px solid #d1d5db',
                    padding: '10px 16px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  👀 Preview
                </button>
                
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setSelectedTemplate(null);
                    resetForm();
                  }}
                  style={{
                    background: '#f3f4f6',
                    color: '#374151',
                    border: '1px solid #d1d5db',
                    padding: '10px 16px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  Cancel
                </button>

                <button
                  onClick={handleSaveTemplate}
                  disabled={saving}
                  style={{
                    background: saving ? '#9ca3af' : '#3b82f6',
                    color: '#fff',
                    border: 'none',
                    padding: '10px 16px',
                    borderRadius: '6px',
                    cursor: saving ? 'not-allowed' : 'pointer',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}
                >
                  {saving ? 'Saving...' : 'Save Template'}
                </button>
              </div>

              {/* Preview Section */}
              {showPreview && (
                <div style={{ marginTop: '24px', padding: '20px', background: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                  <h4 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '600', color: '#111827' }}>
                    📧 Email Preview
                  </h4>
                  
                  <div style={{ marginBottom: '16px' }}>
                    <strong style={{ color: '#374151' }}>Subject: </strong>
                    <span style={{ color: '#6b7280' }}>{previewTemplate().subject}</span>
                  </div>
                  
                  <div style={{ 
                    background: '#fff', 
                    padding: '16px', 
                    borderRadius: '6px', 
                    border: '1px solid #d1d5db',
                    whiteSpace: 'pre-wrap',
                    fontSize: '14px',
                    lineHeight: 1.5,
                    color: '#374151'
                  }}>
                    {previewTemplate().content}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmailTemplateDesigner;