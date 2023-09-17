import React, { useState, useEffect } from 'react';
import { Input, Button, Image, Card } from 'antd';
import { data } from './data/menu'
import type { MenuProps } from 'antd';
import { Dropdown, Space, message, Typography } from 'antd';
const { TextArea } = Input;
const { Title } = Typography;


const View1 = () => {

  const [imageUrl, setImageUrl] = useState('./data/frames/P01_11/frame_0000000082.jpg');
  const [currEp, setCurrEp] = useState(data[0])
  const [currFrame, setCurrFrame] = useState("frame_0000000082")
  const [currItem, setCurrItem] = useState({ "ep_id": "P01_11__0", "id": "P01_11_0", "tar_path": "/share/portal/ys749/EPIC-KITCHENS/P01/rgb_frames/P01_11.tar", "image": "./frame_0000000082.jpg", "action": "take plate", "description": "In the image, there is a man standing on a kitchen floor, holding a plate and a spoon. The plate is positioned on the ground, and the spoon is being held in the man's hand. The man is performing the action of holding the plate and spoon, possibly preparing to serve food or clean up after a meal. The image shows the man's hand holding the spoon and the plate, indicating that he is in the process of using the spoon to scoop or serve food from the plate.", "answer_id": "g6234enEcPchyCH4GiVLty", "model_id": "llava-llama-2-7b-chat-hf-lightning-merge" })
  const [frames, setFrames] = useState([currItem])
  const [currAnnotation, setCurrAnnotation] = useState("")
  const [annotations, setAnnotations] = useState([{ id: "", image: "", states: "" }])


  const loadImage = () => {
    // Load the image using the provided image path
    setImageUrl(`./data/frames/${currEp}/${currFrame}.jpg`);
    findTextAndIndex(currFrame)
  };

  const episodes: MenuProps['items'] = data.map((value, idx) => ({ key: value, label: value }))

  const onChangeEp: MenuProps['onClick'] = ({ key }) => {
    setCurrEp(key)
  };

  useEffect(() => {
    import(`./data/subtitles/${currEp}.json`)
      .then((res) => {
        setFrames(res.default)
        const imgPath = res.default[0].image
        setCurrFrame(imgPath.substring(2, 18))
      })
      .catch(_ => null);

  }, [currEp]);

  useEffect(() => { findTextAndIndex(currFrame); loadImage(); setCurrAnnotation("") }, [frames])

  function findTextAndIndex(imageName: string) {
    const item = frames.find((item) => item.image === `./${imageName}.jpg`);

    if (item) {
      setCurrItem(item);
    } else {
      console.log("not found")
    }
  }

  const saveNextorPrev = (annotation: string, direction: number) => {
    const existed = annotations.findIndex((item) => item.id === currEp && item.image === currFrame)

    if (existed != -1) {
      annotations[existed] = { id: currEp, image: currFrame, states: annotation }
    }
    else {
      setAnnotations([...annotations, { id: currEp, image: currFrame, states: annotation }])
    }
    const nextIdx = frames.indexOf(currItem) + direction

    if (nextIdx < 0 || nextIdx >= frames.length) {
      message.info("no next/prev frame in this episode")
    }
    const nextItem = frames[nextIdx]
    setCurrAnnotation("")
    setCurrItem(nextItem)
    setCurrFrame(nextItem.image.substring(2, 18))
    setImageUrl(`./data/frames/${currEp}/${nextItem.image.substring(2)}`);
    console.log(annotations)

  }

  function downloadJSON() {
    // Convert the JSON data to a Blob
    const jsonData = new Blob([JSON.stringify(annotations.slice(1))], { type: 'application/json' });

    // Create a temporary link element
    const a = document.createElement('a');
    a.href = URL.createObjectURL(jsonData);
    a.download = 'annotations';

    // Trigger a click event on the link to start the download
    a.click();

    // Clean up by revoking the Blob URL
    URL.revokeObjectURL(a.href);
  }


  return (
    <div style={{ margin: '100px' }}>
      <Space>
        <Card bordered={false} style={{ height: 500 }} >
          <h1>Image</h1>
          <Space>
            <Dropdown menu={{ items: episodes, onClick: onChangeEp }} placement="bottomLeft">
              <a onClick={(e) => e.preventDefault()}>
                <Button>{currEp}</Button>
              </a>
            </Dropdown>
            <div style={{ margin: '10', width: '200px' }}>
              <Input value={currFrame} onChange={(e) => setCurrFrame(e.target.value)} />
            </div>
            <Button onClick={loadImage}>
              Load Image
            </Button>
          </Space>
          <div style={{ marginTop: '20px', marginBottom: '20px' }}>
            <Image width={550} src={require(`${imageUrl}`)} />
          </div>

        </Card>
        <Card bordered={false} style={{ width: '50vw', height: 500 }}>
          <Title level={4}>Action</Title>
          {currItem.action}
          <Title level={4}>Description</Title>
          {currItem.description}
          <Title level={4}>States Annotation</Title>
          <TextArea value={currAnnotation} style={{ height: 100 }} onChange={(e) => setCurrAnnotation(e.target.value)} onPressEnter={(e) => { e.preventDefault(); saveNextorPrev(currAnnotation, 1) }} />
        </Card>

      </Space>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px', marginTop: 10 }}>
        <Space align='end' >
          <Button onClick={() => saveNextorPrev(currAnnotation, -1)}>
            Prev
          </Button>
          <Button type='primary' onClick={() => saveNextorPrev(currAnnotation, 1)}>
            Save & Next ↵
          </Button>
        </Space>
      </div>

      <Space>
        <h2>Saved Annotations</h2>
        <Button onClick={() => downloadJSON()}>Download JSON</Button>
      </Space>

      <div>
        {JSON.stringify(annotations.slice(1))}</div>

    </div>

  );
};

export default View1;
