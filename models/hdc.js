'use strict';

let Q = require('q');

module.exports = {
  getHPID(pool, cid) {
    let q = Q.defer();
    pool.getConnection((err, conn) => {
      if (err) {
        console.log(err)
        q.reject(err)
      } else {
        let sql = `select concat(HOSPCODE, PID) as hpid
          from person 
          where cid=?`;
        conn.query(sql, [cid], function (err, rows) {
          if (err) q.reject(err);
          else q.resolve(rows)
        });

        conn.release()
      }
    });

    return q.promise;
  },

  getServices(pool, hpids) {
    let q = Q.defer();
    let _hpids = JSON.stringify(hpids);

    // console.log(_hpids)
    _hpids = _hpids.replace('[', '').replace(']', '')
    pool.getConnection((err, conn) => {
      if (err) {
        console.log(err)
        q.reject(err)
      } else {
        let sql = `select s.HOSPCODE, h.hosname as HOSPNAME, s.DATE_SERV, STR_TO_DATE(s.TIME_SERV,"%H%i%s") as TIME_SERV,
          s.CHIEFCOMP, s.SEQ, s.PID, (
          select count(*) as t
          from labfu where HOSPCODE=s.HOSPCODE and PID=s.PID and SEQ=s.SEQ
          ) as LABS, (
          select an from admission where HOSPCODE=s.HOSPCODE and PID=s.PID and SEQ=s.SEQ
          ) as AN, (
            select count(*) as total 
            from chronicfu where HOSPCODE=s.HOSPCODE and PID=s.PID and SEQ=s.SEQ
            and RETINA not in ('8', '9') and FOOT not in ('8', '9') 
          ) as EFS
          from service as s
          left join chospital as h on h.hoscode=s.HOSPCODE
          where concat(s.HOSPCODE, s.PID) IN (${_hpids})
          order by s.DATE_SERV DESC`;
        console.log(sql);

        conn.query(sql, (err, rows) => {
          if (err) q.reject(err);
          else q.resolve(rows)
        });

        conn.release()
      }
    });

    return q.promise;
  },

  getScreenData(pool, hospcode, pid, seq) {
    let q = Q.defer();
    pool.getConnection((err, conn) => {
      if (err) {
        console.log(err)
        q.reject(err)
      } else {
        let sql = `select s.DATE_SERV, s.TIME_SERV, s.CHIEFCOMP, s.BTEMP, s.SBP, s.DBP, s.PR, s.RR,
          s.REFEROUTHOSP, ho.hosname as REFOUTHOSP_NAME, s.REFERINHOSP, hi.hosname as REFERINHOSP_NAME,
          ins.instype_name as INSTYPE_NAME, s.INSID,
          dx.DIAGCODE, icd.diagename as DIAG_NAME
          from service as s
          left join chospital as ho on ho.hoscode=s.REFEROUTHOSP
          left join chospital as hi on hi.hoscode=s.REFERINHOSP
          left join cinstype as ins on ins.id_instype=s.INSTYPE
          left join diagnosis_opd as dx on dx.HOSPCODE=s.HOSPCODE and dx.PID=s.PID and dx.SEQ=s.SEQ and dx.DIAGTYPE="1"
          left join cicd10tm as icd on icd.diagcode=dx.DIAGCODE
          where s.HOSPCODE=? and s.PID=? and s.SEQ=?
          order by s.DATE_SERV, s.TIME_SERV DESC`;

        conn.query(sql, [hospcode, pid, seq], (err, rows) => {
          if (err) q.reject(err);
          else q.resolve(rows[0])
        });

        conn.release()
      }
    });

    return q.promise;
  },

  getDrugOPD(pool, hospcode, pid, seq) {
    let q = Q.defer();
    pool.getConnection((err, conn) => {
      if (err) {
        console.log(err)
        q.reject(err)
      } else {
        let sql = `select d.DNAME, d.AMOUNT, cu.unit as UNIT
          from drug_opd as d
          left join cunit as cu on cu.id_unit=d.UNIT
          where d.HOSPCODE=? and d.PID=? and d.SEQ=?
          order by d.DNAME`;

        conn.query(sql, [hospcode, pid, seq], (err, rows) => {
          if (err) q.reject(err);
          else q.resolve(rows)
        });

        conn.release()
      }
    });

    return q.promise;
  },

  getDrugIPD(pool, hospcode, pid, an) {
    let q = Q.defer();
    pool.getConnection((err, conn) => {
      if (err) {
        console.log(err)
        q.reject(err)
      } else {
        let sql = `select d.DNAME, d.AMOUNT, cu.unit as UNIT, d.DATESTART
          from drug_ipd as d
          left join cunit as cu on cu.id_unit=d.UNIT
          where d.HOSPCODE=? and d.PID=? and d.AN=?
          order by d.DATESTART ASC`;

        conn.query(sql, [hospcode, pid, an], (err, rows) => {
          if (err) q.reject(err);
          else q.resolve(rows)
        });

        conn.release()
      }
    });

    return q.promise;
  },

  getLab(pool, hospcode, pid, seq) {
    let q = Q.defer();
    pool.getConnection((err, conn) => {
      if (err) {
        console.log(err)
        q.reject(err)
      } else {
        let sql = `select cl.labtest as LABNAME, l.LABRESULT
          from labfu as l
          left join clabtest as cl on cl.id_labtest=l.LABTEST
          where l.HOSPCODE=? and l.PID=? and l.SEQ=?`;

        conn.query(sql, [hospcode, pid, seq], (err, rows) => {
          if (err) q.reject(err);
          else q.resolve(rows)
        });

        conn.release()
      }
    });

    return q.promise;
  },
  
  getAdmission(pool, hospcode, pid, an) {
    let q = Q.defer();
    pool.getConnection((err, conn) => {
      if (err) {
        console.log(err)
        q.reject(err)
      } else {
        let sql = `select a.HOSPCODE, h.hosname as HOSPNAME, a.PID, a.SEQ, a.AN, a.DATETIME_ADMIT, a.DATETIME_DISCH,
        cins.instype_name as INSTYPE_NAME, a.WARDADMIT,
        cds.dischstatus as DISCHSTATUS_NAME,
        cdt.disctype as DISCHTYPE_NAME,
        ipd.CLINIC as DIAG_CODE, icd.diagename as DIAG_NAME,
        a.REFEROUTHOSP, ho.hosname as REFEROUTHOSP_NAME
        from admission as a
        left join cdisctype as cdt on cdt.id_disctype=a.DISCHTYPE
        left join cdischstatus as cds on cds.id_dischstatus=a.DISCHSTATUS
        left join cinstype as cins on cins.id_instype=a.INSTYPE
        left join diagnosis_ipd as ipd on ipd.HOSPCODE=a.HOSPCODE and ipd.PID=a.PID and ipd.SEQ=a.AN and ipd.DIAGCODE="1"
        left join cicd10tm as icd on icd.diagcode=ipd.CLINIC
        left join chospital as h on h.hoscode=a.HOSPCODE
        left join chospital as ho on ho.hoscode=a.REFEROUTHOSP
        where a.HOSPCODE=? and a.PID=? and a.AN=?
        order by a.DATETIME_DISCH desc`;

        conn.query(sql, [hospcode, pid, an], (err, rows) => {
          if (err) q.reject(err);
          else q.resolve(rows[0])
        });

        conn.release()
      }
    });

    return q.promise;
  },
  
  getEFS(pool, hospcode, pid, seq) {
    let q = Q.defer();
    pool.getConnection((err, conn) => {
      if (err) {
        console.log(err)
        q.reject(err)
      } else {
        let sql = `select cu.HOSPCODE, cu.PID, cu.SEQ, cu.DATE_SERV, cu.FOOT, cu.RETINA,
          cf.foot as FOOT_RESULT, cr.retina as RETINA_RESULT
          from chronicfu as cu
          left join cfoot as cf on cf.id_foot=cu.FOOT
          left join cretina as cr on cr.id_retina=cu.RETINA
          where cu.HOSPCODE=? and cu.PID=? and cu.SEQ=?`;

        conn.query(sql, [hospcode, pid, seq], (err, rows) => {
          if (err) q.reject(err);
          else q.resolve(rows[0])
        });

        conn.release()
      }
    });

    return q.promise;
  }

}