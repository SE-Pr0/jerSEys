import React, { useMemo, useState } from 'react';
import { Button, Card, FormField } from '../../components/ui';
import AdminModalPortal from './AdminModalPortal';
import AdminSuiteLayout from './AdminSuiteLayout';
import { buildSearchBlob, normalizeText } from './adminConstants';
import crackedPreset from '../CustomJerseyBuilder/Assets/Presets/Cracked.png';
import flakesPreset from '../CustomJerseyBuilder/Assets/Presets/Flakes.png';
import gridPreset from '../CustomJerseyBuilder/Assets/Presets/Grid.png';
import hexPreset from '../CustomJerseyBuilder/Assets/Presets/Hex.png';
import hexalinesPreset from '../CustomJerseyBuilder/Assets/Presets/Hexalines-copy.png';
import nikeNetherlandsHomePreset from '../CustomJerseyBuilder/Assets/Presets/Nike Netherlands Home.png';
import particlePreset from '../CustomJerseyBuilder/Assets/Presets/Particle.png';
import squaredPreset from '../CustomJerseyBuilder/Assets/Presets/Squared.png';
import squaresPreset from '../CustomJerseyBuilder/Assets/Presets/Squares.png';
import trianglesPreset from '../CustomJerseyBuilder/Assets/Presets/Triangles.png';
import voronoiFracturePreset from '../CustomJerseyBuilder/Assets/Presets/Voronoi-Fracture.png';
import zagsPreset from '../CustomJerseyBuilder/Assets/Presets/Zags.png';
import zigZagPreset from '../CustomJerseyBuilder/Assets/Presets/Zig-Zag.png';

const presetFiles = [
  { fileName: 'Cracked.png', src: crackedPreset },
  { fileName: 'Flakes.png', src: flakesPreset },
  { fileName: 'Grid.png', src: gridPreset },
  { fileName: 'Hex.png', src: hexPreset },
  { fileName: 'Hexalines-copy.png', src: hexalinesPreset },
  { fileName: 'Nike Netherlands Home.png', src: nikeNetherlandsHomePreset },
  { fileName: 'Particle.png', src: particlePreset },
  { fileName: 'Squared.png', src: squaredPreset },
  { fileName: 'Squares.png', src: squaresPreset },
  { fileName: 'Triangles.png', src: trianglesPreset },
  { fileName: 'Voronoi-Fracture.png', src: voronoiFracturePreset },
  { fileName: 'Zags.png', src: zagsPreset },
  { fileName: 'Zig-Zag.png', src: zigZagPreset },
];

const getPresetLabel = (fileName) =>
  fileName
    .replace(/\.[^.]+$/, '')
    .replace(/\s*\([^)]*\)\s*/g, ' ')
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const initialTemplates = presetFiles
  .map(({ fileName, src }, index) => ({
    id: `PAT-${String(index + 1001).padStart(4, '0')}`,
    name: getPresetLabel(fileName),
    image: src,
    fileName,
  }))
  .sort((first, second) => first.name.localeCompare(second.name));

const createTemplateId = () => `PAT-${Math.floor(1000 + Math.random() * 9000)}`;
const PATTERN_LIBRARY_KEY = 'jerseys-pattern-library-v1';
const PATTERN_LIBRARY_EVENT = 'jerseys-pattern-library-change';
const readFileAsDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });

const ManageTemplates = () => {
  const [templates, setTemplates] = useState(() => {
    if (typeof window === 'undefined') {
      return initialTemplates;
    }

    try {
      const storedPatterns = JSON.parse(window.localStorage.getItem(PATTERN_LIBRARY_KEY) || 'null');
      if (!Array.isArray(storedPatterns) || !storedPatterns.length) {
        return initialTemplates;
      }

      return storedPatterns;
    } catch {
      return initialTemplates;
    }
  });
  const [query, setQuery] = useState('');

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState('');
  const [newTemplateImage, setNewTemplateImage] = useState('');

  const [editingTemplate, setEditingTemplate] = useState(null);
  const [editingName, setEditingName] = useState('');
  const [editingImage, setEditingImage] = useState('');

  const filteredTemplates = useMemo(() => {
    const search = normalizeText(query);

    return templates.filter((template) =>
      buildSearchBlob([template.id, template.name, template.image]).includes(search),
    );
  }, [templates, query]);

  const handleDeleteTemplate = (templateId) => {
    setTemplates((currentTemplates) => currentTemplates.filter((template) => template.id !== templateId));
  };

  const openEditTemplate = (template) => {
    setEditingTemplate(template);
    setEditingName(template.name);
    setEditingImage(template.image);
  };

  const closeEditTemplate = () => {
    setEditingTemplate(null);
    setEditingName('');
    setEditingImage('');
  };

  const handleSaveTemplateEdit = () => {
    if (!editingTemplate) {
      return;
    }

    const normalizedName = editingName.trim();
    const normalizedImage = editingImage.trim();
    if (!normalizedName || !normalizedImage) {
      return;
    }

    setTemplates((currentTemplates) =>
      currentTemplates.map((template) =>
        template.id === editingTemplate.id
          ? {
              ...template,
              name: normalizedName,
              image: normalizedImage,
              fileName: template.fileName || `${normalizedName}.png`,
            }
          : template,
      ),
    );
    closeEditTemplate();
  };

  const handleAddTemplate = () => {
    const normalizedName = newTemplateName.trim();
    const normalizedImage = newTemplateImage.trim();
    if (!normalizedName || !normalizedImage) {
      return;
    }

    setTemplates((currentTemplates) => [
      {
        id: createTemplateId(),
        name: normalizedName,
        image: normalizedImage,
        fileName: `${normalizedName}.png`,
      },
      ...currentTemplates,
    ]);
    setNewTemplateName('');
    setNewTemplateImage('');
    setIsAddOpen(false);
  };

  const handleAddImageUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    try {
      const dataUrl = await readFileAsDataUrl(file);
      setNewTemplateImage(dataUrl);
    } catch {
      // Ignore failed file conversion and keep previous value.
    }
  };

  const handleEditImageUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    try {
      const dataUrl = await readFileAsDataUrl(file);
      setEditingImage(dataUrl);
    } catch {
      // Ignore failed file conversion and keep previous value.
    }
  };

  const hasAddValues = newTemplateName.trim() && newTemplateImage.trim();
  const hasEditValues = editingName.trim() && editingImage.trim();

  React.useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    window.localStorage.setItem(PATTERN_LIBRARY_KEY, JSON.stringify(templates));
    window.dispatchEvent(new Event(PATTERN_LIBRARY_EVENT));
  }, [templates]);

  return (
    <AdminSuiteLayout
      className="admin-templates-page"
      description="Manage the pattern presets used in Custom Jersey by adding, editing, and removing patterns."
      eyebrow="Admin Console"
      title={(
        <>
          Manage <span>Patterns</span>
        </>
      )}
    >
      <div className="admin-suite-workspace">
        <Card className="admin-suite-panel admin-suite-main-panel">
          <div className="admin-suite-toolbar">
            <FormField label="Search patterns" htmlFor="admin-pattern-search">
              <input
                className="ui-input"
                id="admin-pattern-search"
                placeholder="Search pattern name or ID"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </FormField>

            <div className="admin-template-toolbar-action">
              <Button onClick={() => setIsAddOpen(true)}>Add New Pattern</Button>
            </div>
          </div>

          <div className="admin-suite-table-header">
            <div>
              <div className="admin-suite-kicker">Pattern library</div>
              <h2 className="admin-suite-table-title">
                {filteredTemplates.length} patterns in view
              </h2>
            </div>
          </div>

          <div className="admin-template-grid" role="list" aria-label="Pattern cards">
            {filteredTemplates.map((template) => (
              <Card className="admin-template-card" key={template.id} role="listitem">
                <div className="admin-template-image-wrap">
                  <img className="admin-template-image" src={template.image} alt={template.name} />

                  <div className="admin-template-hover-overlay">
                    <Button className="admin-suite-inline-button" onClick={() => openEditTemplate(template)}>
                      Edit
                    </Button>
                  </div>
                </div>

                <div className="admin-template-card-body">
                  <strong>{template.name}</strong>
                  <span className="admin-suite-subtext">{template.id}</span>

                  <div className="admin-template-card-actions">
                    <Button className="admin-suite-inline-button" variant="secondary" onClick={() => openEditTemplate(template)}>
                      Edit
                    </Button>
                    <Button
                      className="admin-suite-inline-button"
                      variant="ghost"
                      onClick={() => handleDeleteTemplate(template.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <div className="admin-suite-footnote">
            Showing {filteredTemplates.length} of {templates.length} patterns. Add new patterns or update names and images in one place.
          </div>
        </Card>
      </div>

      {isAddOpen ? (
        <AdminModalPortal>
          <div
            className="admin-template-modal-overlay"
            role="dialog"
            aria-modal="true"
            aria-labelledby="add-template-title"
            onClick={() => setIsAddOpen(false)}
          >
            <div className="admin-template-modal ui-card" onClick={(event) => event.stopPropagation()}>
            <div className="admin-template-modal-head">
              <h3 className="admin-suite-table-title" id="add-template-title">Add New Pattern</h3>
              <Button variant="ghost" onClick={() => setIsAddOpen(false)}>Close</Button>
            </div>

            <div className="admin-template-modal-form">
              <FormField label="Pattern name" htmlFor="add-template-name">
                <input
                  className="ui-input"
                  id="add-template-name"
                  value={newTemplateName}
                  onChange={(event) => setNewTemplateName(event.target.value)}
                  placeholder="Enter pattern name"
                />
              </FormField>
              <FormField label="Pattern image URL" htmlFor="add-template-image">
                <input
                  className="ui-input"
                  id="add-template-image"
                  value={newTemplateImage}
                  onChange={(event) => setNewTemplateImage(event.target.value)}
                  placeholder="https://..."
                />
              </FormField>
              <FormField label="Or upload image" htmlFor="add-template-image-file">
                <input
                  className="ui-input"
                  id="add-template-image-file"
                  type="file"
                  accept="image/*"
                  onChange={handleAddImageUpload}
                />
              </FormField>
            </div>

            <div className="admin-template-modal-actions">
              <Button variant="secondary" onClick={() => setIsAddOpen(false)}>Cancel</Button>
              <Button onClick={handleAddTemplate} disabled={!hasAddValues}>Add Pattern</Button>
            </div>
            </div>
          </div>
        </AdminModalPortal>
      ) : null}

      {editingTemplate ? (
        <AdminModalPortal>
          <div
            className="admin-template-modal-overlay"
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-template-title"
            onClick={closeEditTemplate}
          >
            <div className="admin-template-modal ui-card" onClick={(event) => event.stopPropagation()}>
            <div className="admin-template-modal-head">
              <h3 className="admin-suite-table-title" id="edit-template-title">Edit Pattern</h3>
            </div>

            <div className="admin-template-modal-preview">
              <img className="admin-template-modal-image" src={editingImage || editingTemplate.image} alt={editingName || editingTemplate.name} />
            </div>

            <div className="admin-template-modal-form">
              <FormField label="Pattern name" htmlFor="edit-template-name">
                <input
                  className="ui-input"
                  id="edit-template-name"
                  value={editingName}
                  onChange={(event) => setEditingName(event.target.value)}
                  placeholder="Enter pattern name"
                />
              </FormField>
              <FormField label="Pattern image URL" htmlFor="edit-template-image">
                <input
                  className="ui-input"
                  id="edit-template-image"
                  value={editingImage}
                  onChange={(event) => setEditingImage(event.target.value)}
                  placeholder="https://..."
                />
              </FormField>
              <FormField label="Or upload image" htmlFor="edit-template-image-file">
                <input
                  className="ui-input"
                  id="edit-template-image-file"
                  type="file"
                  accept="image/*"
                  onChange={handleEditImageUpload}
                />
              </FormField>
            </div>

            <div className="admin-template-modal-actions">
              <Button variant="secondary" onClick={closeEditTemplate}>Cancel</Button>
              <Button onClick={handleSaveTemplateEdit} disabled={!hasEditValues}>Save Changes</Button>
            </div>
            </div>
          </div>
        </AdminModalPortal>
      ) : null}
    </AdminSuiteLayout>
  );
};

export default ManageTemplates;
