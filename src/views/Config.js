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

const Config = () => {
  const { theme, setTheme } = useTheme(); // ← CAMBIO AQUÍ
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [logoFile, setLogoFile] = useState(null);
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

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const data = await getConfig();
      if (data && data.config) {
        setFormData(data.config);
        setTheme({
          empresaNombre: data.config.empresa_nombre,
          primaryColor: data.config.primary_color,
          secondaryColor: data.config.secondary_color,
          backgroundColor: data.config.background_color,
          textColor: data.config.text_color,
          logo: data.config.logo,
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
      setLogoFile(e.target.files[0]);
      const reader = new FileReader();
      reader.onload = (event) => {
        setFormData((prev) => ({ ...prev, logo: event.target.result }));
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleSave = async () => {
    try {
      const payload = { ...formData };
      if (logoFile) payload.logo = formData.logo;

      const result = await updateConfig(payload);

      if (result.success || result.status === 'success') {
        setTheme({
          empresaNombre: payload.empresa_nombre,
          primaryColor: payload.primary_color,
          secondaryColor: payload.secondary_color,
          backgroundColor: payload.background_color,
          textColor: payload.text_color,
          logo: payload.logo,
        });
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
      const response = await fetch(`${process.env.REACT_APP_API_URL}/auth/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword
        })
      });

      const data = await response.json();

      if (response.ok && data.status === 'success') {
        setPasswordMessage("Contraseña cambiada exitosamente");
        setTimeout(() => {
          setIsPasswordModalOpen(false);
          setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
          setPasswordMessage("");
        }, 2000);
      } else {
        setPasswordMessage(data.message || "Error al cambiar la contraseña");
      }
    } catch (error) {
      console.error("Error changing password:", error);
      setPasswordMessage("Error de conexión con el servidor");
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
                  <Input type="file" onChange={handleLogoChange} />
                  {formData.logo && (
                    <div className="mt-2">
                      <img
                        src={formData.logo}
                        alt="Logo Preview"
                        height="60"
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