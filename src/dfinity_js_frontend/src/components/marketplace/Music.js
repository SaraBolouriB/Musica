import React, { useEffect, useState, useCallback } from "react";
import PropTypes from "prop-types";
import { Card, Button, Col, Badge, Stack, Form, FloatingLabel } from "react-bootstrap";
import { 
  getComments as getCommentList,
} from "../../utils/marketplace";

const Music = ({ tokemMetadata, music, buy, addComment, likeMusic, unlikeMusic, playMusic }) => {
  const { id, owner, soldNumber, likeNumber, name, description, coverImg, price} = music;
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");

  const triggerBuy = () => {
    buy(id, price);
  };

  const triggerAddComment = () => {
    addComment(id, newComment);
  }

  const trigerLikeMusic = () => {
    likeMusic(id);
  }

  const trigerUnLikeMusic = () => {
    unlikeMusic(id);
  }

  const trigerPlayMusic = () => {
    playMusic(id);
  }

  // function to get the list of musics
  const getComments = useCallback(async (id) => {
    try {
      setComments(await getCommentList(id));
    } catch (error) {
      console.log({ error });
    }
  });

  useEffect(() => {
    getComments(id);
  }, []);

  return (
    <Col key={id}>
      <Card className=" h-100">
        <Card.Header>
          <Stack direction="horizontal" gap={2}>
            <Button
              onClick={trigerLikeMusic}
            >
              like
            </Button>
            <Button
              onClick={trigerUnLikeMusic}
            >
              unlike
            </Button>
            <Badge bg="secondary" className="ms-auto">
              {likeNumber.toString()} Liked
            </Badge>
            <Badge bg="secondary" className="ms-auto">
              {soldNumber.toString()} Sold
            </Badge>
          </Stack>
        </Card.Header>
        <Card.Body className="d-flex  flex-column text-center">
          <Card.Title>{name}</Card.Title>
          <Card.Text className="flex-grow-1 ">{description}</Card.Text>
          <Card.Text className="text-secondary">
            <span>Owner ID: {owner}</span>
          </Card.Text>
          <Card.Text className="text-secondary">
            <span>Music ID: {id}</span>
          </Card.Text>
          <Button
            variant="outline-dark"
            onClick={trigerPlayMusic}
            className="w-100 py-3"
          >
            Play
          </Button>
          <br/>
          <Button
            variant="outline-dark"
            onClick={triggerBuy}
            className="w-100 py-3"
          >
            Download the music for {price} {tokemMetadata.tokenSymbol}
          </Button>
          <br/>
          {comments.map((_comment) => (
              <p>{_comment.description} <b>:ID {_comment.id}</b></p>
          ))}
          <Stack direction="horizontal" gap={2}>
            <Form>
              <FloatingLabel
                controlId="inputName"
                label="Add Comment"
                className="mb-3"
              >
                <Form.Control
                  type="text"
                  onChange={(e) => {
                    setNewComment(e.target.value);
                  }}
                />
              </FloatingLabel>
            </Form>
            <Button
              variant="dark"
              onClick={triggerAddComment}
            >
              Send
            </Button>
          </Stack>
        </Card.Body>
      </Card>
    </Col>
  );
};

Music.propTypes = {
  music: PropTypes.instanceOf(Object).isRequired,
  buy: PropTypes.func.isRequired,
};

export default Music;
