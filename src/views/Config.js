// src/views/Config.js
import React, { useEffect, useState } from "react";
import {
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Form,
  FormGroup,
  Label,
  Input,
  Row,
  Col,
  Alert,
} from "reactstrap";
import { useNavigate } from "react-router-dom";
import { getConfig, updateConfig } from "../api/config";
import { useTheme } from "../context/ThemeContext";
import axiosInstance from "../api/axiosConfig";

const Config = () => {
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [passwordMessage, setPasswordMessage] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [formData, setFormData] = useState({
    empresa_nombre: "",
    primary_color: "",
    secondary_color: "",
    background_color: "",
    text_color: "",
    logo: "",
  });

  // Helper para obtener URL de imagen (Cloudinary o local)
  const getImageUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http') || url.startsWith('data:')) return url;
    return url;
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const data = await getConfig();
      console.log('📦 Config recibida:', data);

      if (data) {
        setFormData({
          empresa_nombre: data.empresa_nombre || "",
          primary_color: data.primary_color || "#3498db",
          secondary_color: data.secondary_color || "#2ecc71",
          background_color: data.background_color || "#f5f5f5",
          text_color: data.text_color || "#333333",
          logo: data.logo || "",
        });

        setTheme({
          empresaNombre: data.empresa_nombre || "Mi Empresa",
          primaryColor: data.primary_color || "#3498db",
          secondaryColor: data.secondary_color || "#2ecc71",
          backgroundColor: data.background_color || "#f5f5f5",
          textColor: data.text_color || "#333333",
          logo: data.logo || "",
        });
      }
    } catch (err) {
      console.error("Error fetching config:", err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogoChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setLogoFile(file);
      
      // Crear preview local
      const reader = new FileReader();
      reader.onload = (event) => {
        setLogoPreview(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    try {
      const payload = {
        empresa_nombre: formData.empresa_nombre,
        primary_color: formData.primary_color,
        secondary_color: formData.secondary_color,
        background_color: formData.background_color,
        text_color: formData.text_color,
        logo_actual: formData.logo, // Logo actual en caso de no cambiar
      };
      
      // Si hay un archivo nuevo, agregarlo
      if (logoFile) {
        payload.logoFile = logoFile;
      }

      const result = await updateConfig(payload);

      if (result.success || result.status === 'success') {
        // Usar el logo devuelto por el servidor (URL de Cloudinary)
        const newLogo = result.config?.logo || formData.logo;
        
        setTheme({
          empresaNombre: payload.empresa_nombre,
          primaryColor: payload.primary_color,
          secondaryColor: payload.secondary_color,
          backgroundColor: payload.background_color,
          textColor: payload.text_color,
          logo: newLogo,
        });
        
        setFormData(prev => ({ ...prev, logo: newLogo }));
        setLogoFile(null);
        setLogoPreview(null);
        setIsModalOpen(false);
        alert("Configuración guardada exitosamente");
      } else {
        alert("Error al guardar configuración");
      }
    } catch (err) {
      console.error("Error saving config:", err);
      alert("Error al guardar configuración");
    }
  };

  const handleChangePassword = async () => {
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      setPasswordMessage("Todos los campos son obligatorios");
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordMessage("Las contraseñas nuevas no coinciden");
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setPasswordMessage("La nueva contraseña debe tener al menos 6 caracteres");
      return;
    }

    setIsChangingPassword(true);
    setPasswordMessage("");

    try {
      const response = await axiosInstance.post('/auth/change-password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });

      if (response.data.status === 'success') {
        setPasswordMessage("Contraseña cambiada exitosamente");
        setTimeout(() => {
          setIsPasswordModalOpen(false);
          setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
          setPasswordMessage("");
        }, 2000);
      } else {
        setPasswordMessage(response.data.message || "Error al cambiar la contraseña");
      }
    } catch (error) {
      console.error("Error changing password:", error);
      setPasswordMessage(error.response?.data?.message || "Error de conexión con el servidor");
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleLogout = () => {
    const confirmLogout = window.confirm("¿Estás seguro que deseas cerrar sesión?");

    if (confirmLogout) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('tenant');
      navigate('/auth/login');
    }
  };

  const openPasswordModal = () => {
    setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    setPasswordMessage("");
    setIsPasswordModalOpen(true);
  };

  // Determinar qué logo mostrar en el preview
  const displayLogo = logoPreview || getImageUrl(formData.logo);

  return (
    <div className="content p-4">
      <Row>
        <Col md="12">
          <h3 className="mb-4">Configuración de Apariencia</h3>

          <div className="d-flex gap-3 mb-3">
            <Button
              color="primary"
              onClick={() => setIsModalOpen(true)}
            >
              <i className="nc-icon nc-palette mr-2" /> Personalizar Tema
            </Button>

            <Button
              color="warning"
              onClick={openPasswordModal}
            >
              <i className="nc-icon nc-key-25 mr-2" />
              Cambiar Contraseña
            </Button>

            <Button
              color="danger"
              onClick={handleLogout}
            >
              <i className="nc-icon nc-user-run mr-2" />
              Cerrar Sesión
            </Button>
          </div>
        </Col>
      </Row>

      {/* Modal de Personalizar Tema */}
      <Modal isOpen={isModalOpen} toggle={() => setIsModalOpen(false)} size="lg">
        <ModalHeader toggle={() => setIsModalOpen(false)}>
          Personalizar Apariencia
        </ModalHeader>
        <ModalBody>
          <Form>
            <Row>
              <Col md="6">
                <FormGroup>
                  <Label>Nombre de Empresa</Label>
                  <Input
                    name="empresa_nombre"
                    value={formData.empresa_nombre}
                    onChange={handleInputChange}
                  />
                </FormGroup>
              </Col>
              <Col md="6">
                <FormGroup>
                  <Label>Logo</Label>
                  <Input type="file" accept="image/*" onChange={handleLogoChange} />
                  {displayLogo && (
                    <div className="mt-2">
                      <img
                        src={displayLogo}
                        alt="Logo Preview"
                        style={{
                          height: "60px",
                          maxWidth: "200px",
                          objectFit: "contain",
                          borderRadius: "4px"
                        }}
                      />
                    </div>
                  )}
                </FormGroup>
              </Col>
            </Row>

            <Row>
              <Col md="6">
                <FormGroup>
                  <Label>Color Primario</Label>
                  <Input
                    type="color"
                    name="primary_color"
                    value={formData.primary_color}
                    onChange={handleInputChange}
                  />
                </FormGroup>
              </Col>
              <Col md="6">
                <FormGroup>
                  <Label>Color Secundario</Label>
                  <Input
                    type="color"
                    name="secondary_color"
                    value={formData.secondary_color}
                    onChange={handleInputChange}
                  />
                </FormGroup>
              </Col>
            </Row>
            <Row>
              <Col md="6">
                <FormGroup>
                  <Label>Color de Fondo</Label>
                  <Input
                    type="color"
                    name="background_color"
                    value={formData.background_color}
                    onChange={handleInputChange}
                  />
                </FormGroup>
              </Col>
              <Col md="6">
                <FormGroup>
                  <Label>Color de Texto</Label>
                  <Input
                    type="color"
                    name="text_color"
                    value={formData.text_color}
                    onChange={handleInputChange}
                  />
                </FormGroup>
              </Col>
            </Row>
          </Form>
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={() => setIsModalOpen(false)}>
            Cancelar
          </Button>
          <Button color="success" onClick={handleSave}>
            <i className="fa fa-save" /> Guardar
          </Button>
        </ModalFooter>
      </Modal>

      {/* Modal de Cambiar Contraseña */}
      <Modal isOpen={isPasswordModalOpen} toggle={() => setIsPasswordModalOpen(false)}>
        <ModalHeader toggle={() => setIsPasswordModalOpen(false)}>
          <i className="nc-icon nc-key-25 mr-2" />
          Cambiar Contraseña
        </ModalHeader>
        <ModalBody>
          <Form>
            <FormGroup>
              <Label>Contraseña Actual</Label>
              <Input
                type="password"
                name="currentPassword"
                value={passwordForm.currentPassword}
                onChange={handlePasswordChange}
                placeholder="Ingresa tu contraseña actual"
                disabled={isChangingPassword}
              />
            </FormGroup>

            <FormGroup>
              <Label>Nueva Contraseña</Label>
              <Input
                type="password"
                name="newPassword"
                value={passwordForm.newPassword}
                onChange={handlePasswordChange}
                placeholder="Ingresa la nueva contraseña (mín. 6 caracteres)"
                disabled={isChangingPassword}
              />
            </FormGroup>

            <FormGroup>
              <Label>Confirmar Nueva Contraseña</Label>
              <Input
                type="password"
                name="confirmPassword"
                value={passwordForm.confirmPassword}
                onChange={handlePasswordChange}
                placeholder="Confirma la nueva contraseña"
                disabled={isChangingPassword}
              />
            </FormGroup>

            {passwordMessage && (
              <Alert color={passwordMessage.includes('exitosamente') ? 'success' : 'danger'}>
                {passwordMessage}
              </Alert>
            )}
          </Form>
        </ModalBody>
        <ModalFooter>
          <Button
            color="secondary"
            onClick={() => setIsPasswordModalOpen(false)}
            disabled={isChangingPassword}
          >
            Cancelar
          </Button>
          <Button
            color="primary"
            onClick={handleChangePassword}
            disabled={isChangingPassword}
          >
            {isChangingPassword ? (
              <>
                <i className="fa fa-spinner fa-spin mr-2" />
                Cambiando...
              </>
            ) : (
              <>
                <i className="nc-icon nc-check-2 mr-2" />
                Cambiar Contraseña
              </>
            )}
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default Config;