import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import toast from "react-hot-toast";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { FIELD_TYPES, DEFAULT_FORM_SCHEMA } from "../types";
import { validateForm, toSnakeCase, generateId } from "../utils";

const SchemaPreview = () => {
  const [schema, setSchema] = useState(null);
  const [originalPrompt, setOriginalPrompt] = useState("");
  const [isEditing, setIsEditing] = useState(null);
  const [editValue, setEditValue] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    // Load schema from session storage
    const storedSchema = sessionStorage.getItem("generatedSchema");
    const storedPrompt = sessionStorage.getItem("originalPrompt");

    if (storedSchema) {
      setSchema(JSON.parse(storedSchema));
    } else {
      // Redirect to landing if no schema
      navigate("/");
    }

    if (storedPrompt) {
      setOriginalPrompt(storedPrompt);
    }
  }, [navigate]);

  const handleFieldUpdate = (fieldIndex, property, value) => {
    setSchema(prev => ({
      ...prev,
      fields: prev.fields.map((field, index) =>
        index === fieldIndex
          ? { ...field, [property]: value }
          : field
      )
    }));
  };

  const handleSchemaUpdate = (property, value) => {
    setSchema(prev => ({
      ...prev,
      [property]: value
    }));
  };

  const handleAddField = () => {
    const newField = {
      id: `field_${generateId()}`,
      label: "New Field",
      type: FIELD_TYPES.TEXT,
      required: false,
      placeholder: null,
      options: null,
      validation: null
    };

    setSchema(prev => ({
      ...prev,
      fields: [...prev.fields, newField]
    }));
  };

  const handleRemoveField = (fieldIndex) => {
    setSchema(prev => ({
      ...prev,
      fields: prev.fields.filter((_, index) => index !== fieldIndex)
    }));
    toast.success("Field removed");
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const items = Array.from(schema.fields);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setSchema(prev => ({
      ...prev,
      fields: items
    }));
  };

  const handleContinue = () => {
    // Validate schema
    const mockFormData = {};
    const { isValid, errors } = validateForm(schema, mockFormData);

    if (!isValid) {
      toast.error("Please fix form validation errors");
      return;
    }

    // Save updated schema and proceed to flow selector
    sessionStorage.setItem("generatedSchema", JSON.stringify(schema));
    navigate("/flow");
  };

  const handleEditInline = (type, index, property, currentValue) => {
    setIsEditing({ type, index, property });
    setEditValue(currentValue || "");
  };

  const handleSaveEdit = () => {
    if (!isEditing) return;

    const { type, index, property } = isEditing;

    if (type === "field") {
      handleFieldUpdate(index, property, editValue);
    } else if (type === "schema") {
      handleSchemaUpdate(property, editValue);
    }

    setIsEditing(null);
    setEditValue("");
  };

  const handleCancelEdit = () => {
    setIsEditing(null);
    setEditValue("");
  };

  if (!schema) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-300">Loading schema...</p>
        </div>
      </div>
    );
  }

  const fieldTypeOptions = Object.entries(FIELD_TYPES).map(([key, value]) => ({
    label: key.charAt(0) + key.slice(1).toLowerCase().replace(/_/g, ' '),
    value
  }));

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="heading-lg mb-2">Review Your Form</h1>
            <p className="text-muted-300">
              Review and edit your AI-generated form before creating it
            </p>
          </div>
          <div className="flex space-x-3">
            <Button variant="outline" onClick={() => navigate("/")}>
              Start Over
            </Button>
            <Button onClick={handleContinue}>
              Continue to Creation
              <svg className="w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Button>
          </div>
        </div>

        {/* Original Prompt */}
        {originalPrompt && (
          <Card variant="outline" className="mb-6">
            <CardContent className="pt-4">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-primary-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium text-foreground mb-1">Original Prompt</h3>
                  <p className="text-sm text-muted-300">{originalPrompt}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Schema Editor */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Form Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Form Title */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Form Title
                </label>
                {isEditing?.type === "schema" && isEditing?.property === "title" ? (
                  <div className="flex space-x-2">
                    <Input
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && handleSaveEdit()}
                      className="flex-1"
                    />
                    <Button size="sm" onClick={handleSaveEdit}>Save</Button>
                    <Button size="sm" variant="outline" onClick={handleCancelEdit}>Cancel</Button>
                  </div>
                ) : (
                  <div
                    className="p-3 border border-white/10 rounded-lg cursor-pointer hover:bg-surface-800/30 transition-colors"
                    onClick={() => handleEditInline("schema", null, "title", schema.title)}
                  >
                    <span className="text-foreground">{schema.title || "Untitled Form"}</span>
                  </div>
                )}
              </div>

              {/* Form Description */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Description
                </label>
                {isEditing?.type === "schema" && isEditing?.property === "description" ? (
                  <div className="flex space-x-2">
                    <Input
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && handleSaveEdit()}
                      className="flex-1"
                    />
                    <Button size="sm" onClick={handleSaveEdit}>Save</Button>
                    <Button size="sm" variant="outline" onClick={handleCancelEdit}>Cancel</Button>
                  </div>
                ) : (
                  <div
                    className="p-3 border border-white/10 rounded-lg cursor-pointer hover:bg-surface-800/30 transition-colors min-h-[48px]"
                    onClick={() => handleEditInline("schema", null, "description", schema.description)}
                  >
                    <span className="text-muted-300">{schema.description || "Click to add description"}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Form Fields */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Form Fields ({schema.fields.length})</CardTitle>
              <Button size="sm" onClick={handleAddField}>
                <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Field
              </Button>
            </CardHeader>
            <CardContent>
              <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="fields">
                  {(provided, snapshot) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className={`space-y-3 ${snapshot.isDraggingOver ? 'bg-primary-500/5 rounded-lg p-2' : ''}`}
                    >
                      <AnimatePresence>
                        {schema.fields.map((field, index) => (
                          <Draggable key={field.id} draggableId={field.id} index={index}>
                            {(provided, snapshot) => (
                              <motion.div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                layout
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className={`glass rounded-lg p-4 space-y-3 ${
                                  snapshot.isDragging ? 'shadow-2xl rotate-2' : ''
                                }`}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-3">
                                    <div {...provided.dragHandleProps} className="cursor-grab active:cursor-grabbing text-muted-300 hover:text-primary-500">
                                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                                      </svg>
                                    </div>
                                    <span className="text-sm font-medium text-foreground">
                                      {field.label}
                                    </span>
                                    {field.required && (
                                      <span className="text-xs bg-danger-400/20 text-danger-400 px-2 py-0.5 rounded-full">
                                        Required
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <span className="text-xs text-muted-300 bg-surface-700 px-2 py-1 rounded">
                                      {field.type}
                                    </span>
                                    <Button
                                      size="icon-sm"
                                      variant="ghost"
                                      onClick={() => handleRemoveField(index)}
                                      className="text-danger-400 hover:text-danger-300"
                                    >
                                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                      </svg>
                                    </Button>
                                  </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3 text-sm">
                                  <div>
                                    <label className="text-muted-300">Label:</label>
                                    {isEditing?.type === "field" && isEditing?.index === index && isEditing?.property === "label" ? (
                                      <div className="flex space-x-1 mt-1">
                                        <Input
                                          size="sm"
                                          value={editValue}
                                          onChange={(e) => setEditValue(e.target.value)}
                                          onKeyPress={(e) => e.key === "Enter" && handleSaveEdit()}
                                          className="flex-1"
                                        />
                                        <Button size="icon-sm" onClick={handleSaveEdit}>✓</Button>
                                      </div>
                                    ) : (
                                      <div
                                        className="mt-1 p-2 bg-surface-800/50 rounded cursor-pointer hover:bg-surface-700/50"
                                        onClick={() => handleEditInline("field", index, "label", field.label)}
                                      >
                                        {field.label}
                                      </div>
                                    )}
                                  </div>

                                  <div>
                                    <label className="text-muted-300">Type:</label>
                                    <select
                                      value={field.type}
                                      onChange={(e) => handleFieldUpdate(index, "type", e.target.value)}
                                      className="mt-1 w-full p-2 bg-surface-800/50 rounded border border-white/10 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    >
                                      {fieldTypeOptions.map(option => (
                                        <option key={option.value} value={option.value}>
                                          {option.label}
                                        </option>
                                      ))}
                                    </select>
                                  </div>

                                  <div>
                                    <label className="text-muted-300">Placeholder:</label>
                                    {isEditing?.type === "field" && isEditing?.index === index && isEditing?.property === "placeholder" ? (
                                      <div className="flex space-x-1 mt-1">
                                        <Input
                                          size="sm"
                                          value={editValue}
                                          onChange={(e) => setEditValue(e.target.value)}
                                          onKeyPress={(e) => e.key === "Enter" && handleSaveEdit()}
                                          className="flex-1"
                                        />
                                        <Button size="icon-sm" onClick={handleSaveEdit}>✓</Button>
                                      </div>
                                    ) : (
                                      <div
                                        className="mt-1 p-2 bg-surface-800/50 rounded cursor-pointer hover:bg-surface-700/50 text-muted-300"
                                        onClick={() => handleEditInline("field", index, "placeholder", field.placeholder)}
                                      >
                                        {field.placeholder || "Click to add"}
                                      </div>
                                    )}
                                  </div>

                                  <div>
                                    <label className="text-muted-300 flex items-center space-x-2">
                                      <input
                                        type="checkbox"
                                        checked={field.required}
                                        onChange={(e) => handleFieldUpdate(index, "required", e.target.checked)}
                                        className="w-4 h-4 text-primary-500 bg-surface-800 border-gray-600 rounded focus:ring-primary-500"
                                      />
                                      <span>Required</span>
                                    </label>
                                  </div>
                                </div>

                                {/* Options for select/radio/checkbox fields */}
                                {(field.type === FIELD_TYPES.SELECT || field.type === FIELD_TYPES.RADIO || field.type === FIELD_TYPES.CHECKBOX) && (
                                  <div>
                                    <label className="text-muted-300 text-sm">Options (one per line):</label>
                                    <textarea
                                      value={(field.options || []).join('\n')}
                                      onChange={(e) => handleFieldUpdate(index, "options", e.target.value.split('\n').filter(o => o.trim()))}
                                      placeholder="Option 1&#10;Option 2&#10;Option 3"
                                      className="mt-1 w-full p-2 bg-surface-800/50 rounded border border-white/10 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                                      rows="3"
                                    />
                                  </div>
                                )}
                              </motion.div>
                            )}
                          </Draggable>
                        ))}
                      </AnimatePresence>
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>

              {schema.fields.length === 0 && (
                <div className="text-center py-8 text-muted-300">
                  <svg className="w-12 h-12 mx-auto mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p>No fields yet. Click "Add Field" to get started.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Live Preview */}
        <div className="lg:sticky lg:top-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                Live Preview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="glass-card p-6 space-y-6">
                {/* Form Header */}
                <div className="text-center space-y-2">
                  <h2 className="text-xl font-semibold text-foreground">
                    {schema.title || "Untitled Form"}
                  </h2>
                  {schema.description && (
                    <p className="text-muted-300">{schema.description}</p>
                  )}
                </div>

                {/* Form Fields Preview */}
                <div className="space-y-4">
                  {schema.fields.map((field, index) => (
                    <motion.div
                      key={field.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="space-y-2"
                    >
                      <label className="block text-sm font-medium text-foreground">
                        {field.label}
                        {field.required && <span className="text-danger-400 ml-1">*</span>}
                      </label>

                      {/* Render different field types */}
                      {field.type === FIELD_TYPES.TEXTAREA ? (
                        <textarea
                          placeholder={field.placeholder || ''}
                          disabled
                          className="w-full p-3 bg-surface-800/50 border border-white/10 rounded-lg text-foreground placeholder:text-muted-300 resize-none"
                          rows="3"
                        />
                      ) : field.type === FIELD_TYPES.SELECT ? (
                        <select
                          disabled
                          className="w-full p-3 bg-surface-800/50 border border-white/10 rounded-lg text-foreground"
                        >
                          <option>{field.placeholder || 'Select an option'}</option>
                          {field.options?.map((option, i) => (
                            <option key={i} value={option}>{option}</option>
                          ))}
                        </select>
                      ) : field.type === FIELD_TYPES.RADIO ? (
                        <div className="space-y-2">
                          {field.options?.map((option, i) => (
                            <label key={i} className="flex items-center space-x-2">
                              <input
                                type="radio"
                                name={field.id}
                                value={option}
                                disabled
                                className="w-4 h-4 text-primary-500 bg-surface-800 border-gray-600"
                              />
                              <span className="text-sm text-foreground">{option}</span>
                            </label>
                          ))}
                        </div>
                      ) : field.type === FIELD_TYPES.CHECKBOX ? (
                        <div className="space-y-2">
                          {field.options?.map((option, i) => (
                            <label key={i} className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                value={option}
                                disabled
                                className="w-4 h-4 text-primary-500 bg-surface-800 border-gray-600 rounded"
                              />
                              <span className="text-sm text-foreground">{option}</span>
                            </label>
                          ))}
                        </div>
                      ) : (
                        <input
                          type={field.type}
                          placeholder={field.placeholder || ''}
                          disabled
                          className="w-full p-3 bg-surface-800/50 border border-white/10 rounded-lg text-foreground placeholder:text-muted-300"
                        />
                      )}
                    </motion.div>
                  ))}
                </div>

                {/* Submit Button Preview */}
                <div className="pt-4 border-t border-white/10">
                  <Button disabled className="w-full" size="lg">
                    Submit Form
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SchemaPreview;
