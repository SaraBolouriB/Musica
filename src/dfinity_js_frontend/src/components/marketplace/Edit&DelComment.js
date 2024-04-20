import React, { useState } from "react";
import PropTypes from "prop-types";
import { Button, Modal, Form, FloatingLabel } from "react-bootstrap";

const EditComment = ({ save }) => {
  const [id, setID] = useState();  
  const [description, setDescription] = useState();
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
        style={{ width: "65px" }}
      >
        Edit Comment
      </Button>
      <Modal show={show} onHide={handleClose} centered>
        <Modal.Header closeButton>
          <Modal.Title>Modify Comment</Modal.Title>
        </Modal.Header>
        <Form>
          <Modal.Body>
            <FloatingLabel
              controlId="inputName"
              label="Comment ID"
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
                description,
              });
              handleClose();
            }}
          >
            Save comment
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
            Delete comment
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

EditComment.propTypes = {
  save: PropTypes.func.isRequired,
};

export default EditComment;
