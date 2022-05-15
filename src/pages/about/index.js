import React from 'react'
import './about.scss'
import { Doctitles, Footer } from "../../config"
import { Card, Avatar, Row, Image, Typography, Space, Divider } from 'antd'
import { MailOutlined, TwitterOutlined, LinkedinOutlined } from '@ant-design/icons';
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
                    <p className="beige">a logistican who is just having fun</p><br/>
                    <Space size="middle">
                        <a className="link" href="mailto:riyonugroho@outlook.com"><MailOutlined  className="icon"/></a> |
                        <a className="link" href="https://twitter.com/riyooho"><TwitterOutlined className="icon"/></a> |
                        <a className="link" href="https://www.linkedin.com/in/wsnugroho"><LinkedinOutlined className="icon"/></a>
                    </Space>
                    <Divider orientation="left" style={{borderColor: 'beige', color: 'beige'}}>output</Divider>
                    <a href=""><div className="button">🚧🚧  still developing ideas~ 🚧🚧</div></a>
                </Card>
                <Footer/>
            </div>
        </div>
    )
}

export default About
