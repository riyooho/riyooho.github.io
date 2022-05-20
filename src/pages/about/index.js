import React from 'react'
import './about.scss'
import { Doctitles, Footer } from "../../config"
import { Card, Avatar, Row, Image, Typography, Space, Divider, Tooltip } from 'antd'
import { MailOutlined, InstagramOutlined, LinkedinOutlined } from '@ant-design/icons';
import { AvaBg } from '../../assets'

const { Title } = Typography

const About = () => {
    Doctitles("About @riyooho")
    return (
        <div className="main-page">
            <div className="box">
                <Card bordered={false} style={{ textAlign: "center", width: 350, backgroundColor: "#393e46", borderRadius: '50px 50px 0 0', boxShadow: '0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)' }}>
                    <Space direction="vertical" size={30}>
                        <Row justify="center" className="avatar">
                            <Avatar size={150} bordered
                            src={<Image src={AvaBg} preview={false}/>}
                            />
                        </Row>
                        <Title level={3} style={{color: "beige"}}>
                            Wahyu Satrio Nugroho
                        </Title>
                    </Space>
                    <p className="beige">a logistician who is having fun with coding <Tooltip title="open to work">🟢</Tooltip></p>
                    <a href="https://www.notion.so/Wahyu-Satrio-Nugroho-32d09ba29ffe4de1bf70031e78824479"><div className="button2 margintop"><span>resume</span></div></a>
                    <br/>
                    <Space size="middle">
                        <a className="link" href="mailto:riyonugroho@outlook.com"><MailOutlined  className="icon"/></a> |
                        <a className="link" href="https://instagram.com/riyooho"><InstagramOutlined className="icon"/></a> |
                        <a className="link" href="https://www.linkedin.com/in/wsnugroho"><LinkedinOutlined className="icon"/></a>
                    </Space>
                    <Divider orientation="left" style={{borderColor: 'beige', color: 'beige'}}>output</Divider>
                    <a href=""><div className="button1">🚧🚧  still developing ideas~ 🚧🚧</div></a>
                </Card>
                <Footer/>
            </div>
        </div>
    )
}

export default About
