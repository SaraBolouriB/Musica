import React, { useState } from "react";
import PropTypes from "prop-types";
import { Button, Modal, Form, FloatingLabel } from "react-bootstrap";

const EditMusic = ({ save }) => {
  const [id, setID] = useState();  
  const [name, setName] = useState();
  const [coverImg, setImage] = useState();
  const [description, setDescription] = useState();
  const [price, setPrice] = useState();
  const isFormFilled = () => id;

  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  return (
    <>
      <Button
        onClick={handleShow}
        variant="dark"
        className="rounded-pill px-0"
        style={{ width: "55px" }}
      >
        Edit Music
      </Button>
      <Modal show={show} onHide={handleClose} centered>
        <Modal.Header closeButton>
          <Modal.Title>Modify Music</Modal.Title>
        </Modal.Header>
        <Form>
          <Modal.Body>
            <FloatingLabel
              controlId="inputName"
              label="Music ID"
              className="mb-3"
            >
              <Form.Control
                type="text"
                onChange={(e) => {
                  setID(e.target.value);
                }}
                placeholder="Music ID"
              />
            </FloatingLabel>
            <FloatingLabel
              controlId="inputName"
              label="Music name"
              className="mb-3"
            >
              <Form.Control
                type="text"
                onChange={(e) => {
                  setName(e.target.value);
                }}
                placeholder="Modify music name"
              />
            </FloatingLabel>
            <FloatingLabel
              controlId="inputUrl"
              label="Change Image URL"
              className="mb-3"
            >
              <Form.Control
                type="text"
                placeholder="Image URL"
                onChange={(e) => {
                  setImage(e.target.value);
                }}
              />
            </FloatingLabel>
            <FloatingLabel
              controlId="inputDescription"
              label="Description"
              className="mb-3"
            >
              <Form.Control
                as="textarea"
                placeholder="description"
                style={{ height: "80px" }}
                onChange={(e) => {
                  setDescription(e.target.value);
                }}
              />
            </FloatingLabel>
            <FloatingLabel
              controlId="inputPrice"
              label="Price"
              className="mb-3"
            >
              <Form.Control
                type="text"
                placeholder="Price"
                onChange={(e) => {
                  setPrice(e.target.value);
                }}
              />
            </FloatingLabel>
          </Modal.Body>
        </Form>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={handleClose}>
            Close
          </Button>
          <Button
            variant="dark"
            disabled={!isFormFilled()}
            onClick={() => {
              save({
                id,
                name,
                coverImg,
                description,
                price,
              });
              handleClose();
            }}
          >
            Save music
          </Button>
          <Button
            variant="dark"
            disabled={!isFormFilled()}
            onClick={() => {
              save({
                id
              });
              handleClose();
            }}
          >
            Delete music
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

EditMusic.propTypes = {
  save: PropTypes.func.isRequired,
};

export default EditMusic;
