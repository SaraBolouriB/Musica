import React from "react";
import PropTypes from "prop-types";
import { Card, Button, Col, Badge, Stack } from "react-bootstrap";
import { Principal } from "@dfinity/principal";

const Product = ({ tokemMetadata, music, buy }) => {
  const { id, owner, soldNumber, likeNumber, name, description, attachmentURL, price} = music;

  const triggerBuy = () => {
    buy(id, price);
  };

  return (
    <Col key={id}>
      <Card className=" h-100">
        <Card.Header>
          <Stack direction="horizontal" gap={2}>
            <span className="font-monospace text-secondary">{Principal.from(owner).toText()}</span>
            <Badge bg="secondary" className="ms-auto">
              {soldNumber.toString()} Sold
            </Badge>
            <Badge bg="secondary" className="ms-auto">
              {likeNumber.toString()} Liked
            </Badge>
          </Stack>
        </Card.Header>
        <div className=" ratio ratio-4x3">
          <img src={attachmentURL} alt={name} style={{ objectFit: "cover" }} />
        </div>
        <Card.Body className="d-flex  flex-column text-center">
          <Card.Title>{name}</Card.Title>
          <Card.Text className="flex-grow-1 ">{description}</Card.Text>
          <Card.Text className="text-secondary">
            <span>{owner}</span>
          </Card.Text>
          <Card.Text className="text-secondary">
            <span>{Principal.from(owner).toText()}</span>
          </Card.Text>
          <Button
            variant="outline-dark"
            onClick={triggerBuy}
            className="w-100 py-3"
          >
            Buy for {price} {tokemMetadata.tokenSymbol}
          </Button>
        </Card.Body>
      </Card>
    </Col>
  );
};

Product.propTypes = {
  music: PropTypes.instanceOf(Object).isRequired,
  buy: PropTypes.func.isRequired,
};

export default Product;
