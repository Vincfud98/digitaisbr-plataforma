import { Skeleton, Card, Row, Col } from 'antd';

export default function PageSkeleton() {
  return (
    <div style={{ padding: 24 }}>
      <Skeleton active paragraph={false} title={{ width: 200 }} style={{ marginBottom: 20 }} />
      <Row gutter={[12, 12]}>
        {[1, 2, 3, 4].map((i) => (
          <Col xs={12} sm={12} lg={6} key={i}>
            <Card style={{ borderRadius: 10 }}>
              <Skeleton active paragraph={false} title={{ width: '60%' }} />
              <Skeleton.Input active size="small" style={{ width: '80%', marginTop: 8 }} />
            </Card>
          </Col>
        ))}
      </Row>
      <Row gutter={[16, 16]} style={{ marginTop: 20 }}>
        <Col xs={24} lg={16}>
          <Card style={{ borderRadius: 12 }}>
            <Skeleton active paragraph={{ rows: 8 }} />
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card style={{ borderRadius: 12 }}>
            <Skeleton active paragraph={{ rows: 8 }} />
          </Card>
        </Col>
      </Row>
    </div>
  );
}
