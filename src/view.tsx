import React, { useState, useEffect } from 'react';
import { Input, Button, Image, Card, AutoComplete } from 'antd';
import { data } from './data/menu'
import type { MenuProps } from 'antd';
import { Dropdown, Space, message, Typography } from 'antd';
import { dictionary } from './data/dict';
const { TextArea } = Input;
const { Title } = Typography;



const View1 = () => {

  const [imageUrl, setImageUrl] = useState('./data/frames/P01_14/frame_0000000152.jpg');
  const [currEp, setCurrEp] = useState(data[0])
  const [currFrame, setCurrFrame] = useState("frame_0000000152")
  const [currItem, setCurrItem] = useState({
    "ep_id": "P01_14__0",
    "id": "P01_14_0",
    "tar_path": "/share/portal/ys749/EPIC-KITCHENS/P01/rgb_frames/P01_14.tar",
    "image": "./frame_0000000182.jpg",
    "start_image": "./frame_0000000152.jpg",
    "end_image": "./frame_0000000274.jpg",
    "action": "take bin",
    "objects": [
      "bin/garbage can/recycling bin",
      "right hand",
      "left hand"
    ]
  })
  const [frames, setFrames] = useState([currItem])
  const [currAnnotationList, setCurrAnnotationList] = useState([""])
  const [currAnnotation, setCurrAnnotation] = useState("")
  const [annotations, setAnnotations] = useState([{ id: "", start_image: "", states: [""] }])

  const [options, setOptions] = useState<{ value: string }[]>(dictionary)

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
        const imgPath = res.default[0].start_image
        setCurrFrame(imgPath.substring(2, 18))
      })
      .catch(_ => null);

  }, [currEp]);

  useEffect(() => { findTextAndIndex(currFrame); loadImage(); setCurrAnnotationList([""]) }, [frames])

  useEffect(() => {
    const existed = annotations.find((item) => item.id.startsWith(currEp) && item.start_image === currFrame)
    if (existed !== undefined) {
      setCurrAnnotationList(existed.states);
    }
    else {
      setCurrAnnotationList([""])
    }
  }, [currEp + currFrame])

  function findTextAndIndex(imageName: string) {
    const item = frames.find((item) => item.start_image === `./${imageName}.jpg`);

    if (item) {
      setCurrItem(item);
    } else {
      console.log("not found")
    }
  }

  const onEnter = (annotation: string) => {
    if (currAnnotationList[0] === "") {
      setCurrAnnotationList([annotation])

    }
    else {
      setCurrAnnotationList([...currAnnotationList, annotation])
    }
    setCurrAnnotation("")
  }

  const saveNextorPrev = (direction: number) => {
    const existed = annotations.findIndex((item) => item.id.startsWith(currEp) && item.start_image === currFrame)
    console.log(existed)

    if (existed != -1) {
      annotations[existed] = { id: currItem.id, start_image: currFrame, states: currAnnotationList }
    }
    else {
      setAnnotations([...annotations, { id: currItem.id, start_image: currFrame, states: currAnnotationList }])
    }
    const nextIdx = frames.indexOf(currItem) + direction

    if (nextIdx < 0 || nextIdx >= frames.length) {
      message.info("no next/prev frame in this episode")
    }
    else {
      const nextItem = frames[nextIdx]
      // setCurrAnnotationList([""])
      setCurrAnnotation("")
      setCurrItem(nextItem)
      setCurrFrame(nextItem.start_image.substring(2, 18))
      setImageUrl(`./data/frames/${currEp}/${nextItem.start_image.substring(2)}`);
    }

  }

  const onChangeList = (lst: string) => {
    try {
      const value = eval(lst)
      if (Array.isArray(value)) {
        setCurrAnnotationList(value)
      }
    }
    catch (e) {
      message.info("please make sure inputs are in string[] format")
    }
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
          <Title level={4}>Objects</Title>
          {JSON.stringify(currItem.objects)}
          <Title level={4}>States Annotation</Title>
          <AutoComplete options={options.filter((item) => item.value.startsWith(currAnnotation))} value={currAnnotation} onChange={(e) => setCurrAnnotation(e)} style={{ width: 400 }} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); onEnter(currAnnotation) } }} ></AutoComplete>
          <div style={{ marginTop: '10px' }}></div>
          <TextArea value={JSON.stringify(currAnnotationList)} onChange={(e) => onChangeList(e.target.value)} />
        </Card>

      </Space>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px', marginTop: 10 }}>
        <Space align='end' >
          <Button onClick={() => saveNextorPrev(-1)}>
            Prev
          </Button>
          <Button type='primary' onClick={() => saveNextorPrev(1)}>
            Save & Next
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
